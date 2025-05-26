import type { NewReleasesI, SavedArtistI } from "@model/spotify";
import type { Artist } from "@model/spotify/liked-tracks";
import type { User } from "@model/spotify/user";
import type { SpotifyServiceI } from "@server/container/types";
import { logger } from "@server/utils/logger";
import axios from "axios";
import createHttpError from "http-errors";
import pLimit from "p-limit";
import { SPOTIFY_API_TOKEN } from "../utils/constants";
import type { UpdateUserPlaylistI } from "./types";

export function SpotifyService({ repository, env, api }: SpotifyServiceI) {
	async function initialize(): Promise<void> {
		await repository.connect();
	}

	async function shutdown(): Promise<void> {
		await repository.disconnect();
	}

	async function callbackHandler(code: string) {
		const tokens = await getTokens(code);
		const userProfile = await api.getSpotifyUserProfile(tokens.access_token);

		const user = await getUser(userProfile.id);
		if (!user) {
			await saveUser({
				userId: userProfile.id,
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token,
				profile: userProfile,
				saved_artists: [],
			});
		}

		return {
			userProfile,
			...tokens,
		};
	}

	async function refreshToken(refresh_token: string) {
		return await axios.post(
			SPOTIFY_API_TOKEN,
			new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: refresh_token as string,
				client_id: env.SPOTIFY_CLIENT_ID as string,
				client_secret: env.SPOTIFY_CLIENT_SECRET as string,
			}),
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } },
		);
	}

	async function getValidToken(user: User) {
		try {
			await api.validateToken(user.access_token);
			return user.access_token;
		} catch {
			const { data } = await refreshToken(user.refresh_token);
			user.access_token = data.access_token;
			await saveUser(user);
			logger.info("getValidToken:Token refreshed.");
			return data.access_token;
		}
	}

	async function getTokens(code: string) {
		const { data } = await axios.post(
			SPOTIFY_API_TOKEN,
			new URLSearchParams({
				grant_type: "authorization_code",
				code: code as string,
				redirect_uri: `${env.SERVER_URL}/api/callback`,
				client_id: `${env.SPOTIFY_CLIENT_ID}`,
				client_secret: `${env.SPOTIFY_CLIENT_SECRET}`,
			}),
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } },
		);

		const { access_token, refresh_token } = data;
		logger.info("getTokens:Tokens fetched from Spotify.", {
			expires: data.expires_in,
			redirect_uri: `${env.SERVER_URL}/api/callback`,
		});

		return {
			access_token,
			refresh_token,
			frontend_uri: env.FRONTEND_URL,
		};
	}

	async function getUser(userId: string) {
		return await repository.getUser(userId);
	}

	async function saveUser(user: User) {
		const result = await repository.saveUser(user);

		logger.info("saveUser:User saved in MongoDB.", result);
		return result;
	}

	async function getSpotifyArtists(token: string) {
		const tracks = await api.getSavedTracks(token);

		const artistMap = new Map<string, Artist>();

		for (const item of tracks.items) {
			for (const artist of item.track.artists) {
				if (!artistMap.has(artist.id)) {
					artistMap.set(artist.id, artist);
				}
			}
		}

		logger.info(
			"getSpotifyArtists:Artists fetched from saved tracks.",
			artistMap.size,
		);
		return Array.from(artistMap.values());
	}

	async function saveArtists(userId: string, artists: Array<Artist>) {
		if (artists.length === 0) {
			logger.warn("saveArtists:No artists to save.");
			return null;
		}

		const artistsToSave: Array<SavedArtistI> = artists.map((artist) => ({
			id: artist.id,
			name: artist.name,
			uri: artist.uri,
			image: artist?.images?.[0]?.url || "",
			createdDate: new Date(),
		}));

		const result = await repository.saveArtists(userId, artistsToSave);

		logger.info(
			`saveArtists:${artists.length} artists added/updated in the database.`,
		);
		return result;
	}

	async function removeSavedArtist(userId: string, id: string) {
		const result = await repository.removeSavedArtist(userId, id);

		logger.info(
			`removeSavedArtist:Removed artist with id: ${id} from the database.`,
		);
		return result;
	}

	async function getAllArtistsIds(
		userId: string,
	): Promise<Array<SavedArtistI>> {
		const savedArtists = await repository.getAllArtists(userId);
		logger.info(
			`getAllArtistsIds:Fetched ${savedArtists.length} saved artists for user ${userId}.`,
		);

		if (!savedArtists) {
			createHttpError(404, `No saved artists found for user ${userId}.`);
		}

		return savedArtists;
	}

	async function fetchNewReleases(
		userId: string,
		token: string,
		fromDate?: string,
	) {
		const artists = await repository.getAllArtists(userId);
		if (!artists || artists.length === 0) {
			logger.warn("fetchNewReleases:No artists found for user:", userId);
			return [];
		}

		logger.info(
			`fetchNewReleases:${artists.length} Artists retrieved from MongoDB.`,
		);

		const limit = pLimit(5);

		const releasesArray = await Promise.all(
			artists.map((artist) =>
				limit(async () => {
					try {
						const release = await api.getArtistAlbums(
							token,
							artist.id,
							fromDate,
						);

						logger.info(
							`fetchNewReleases:Release returned for ${artist.id}:`,
							release,
						);
						return release;
					} catch (error) {
						logger.error(
							`fetchNewReleases:Failed to fetch albums for artist ${artist.id}:`,
							error,
						);
						return [];
					}
				}),
			),
		);

		return releasesArray.flat();
	}

	async function updateUserPlaylist({
		userId,
		token,
		playlist,
		fromDate,
	}: UpdateUserPlaylistI) {
		const newReleases: Array<NewReleasesI> = await fetchNewReleases(
			userId,
			token,
			fromDate,
		);

		logger.info("updateUserPlaylist:All new releases collected from Spotify.", {
			newReleases: newReleases.length,
			userId,
		});

		if (newReleases.length === 0) {
			logger.warn(`updateUserPlaylist:No new releases found for ${userId}`);
			return [];
		}

		const limit = pLimit(5);

		const trackUris = (
			await Promise.all(
				newReleases.map(({ uri, id }) =>
					limit(async () => {
						if (uri.includes("album")) {
							return await api.getAlbumTracks(token, id);
						}
						return uri;
					}),
				),
			)
		).flat();

		logger.info("updateUserPlaylist:Flattened track Uris", {
			trackUris: trackUris.length,
			userId,
		});

		const result = await api.addTracksToPlaylist(token, playlist.id, trackUris);
		return result;
	}

	async function getSpotifyPlaylist(userId: string, token: string) {
		const existingPlaylist = await repository.getPlaylist(userId);
		if (existingPlaylist) {
			logger.info(
				"getSpotifyPlaylist:Playlist found in MongoDB:",
				existingPlaylist.name,
			);
			return existingPlaylist;
		}

		logger.warn(
			`getSpotifyPlaylist:No playlist found in MongoDB for ${userId}`,
		);
		const newPlaylist = await api.createSpotifyPlaylist(token);

		if (newPlaylist) {
			const res = await repository.createPlaylist(userId, newPlaylist);
			if (res.acknowledged) {
				logger.info(
					"getSpotifyPlaylist:Playlist created in MongoDB:",
					newPlaylist.name,
				);
				return newPlaylist;
			}
		}
		return null;
	}

	async function updateNewReleases(
		userId: string,
		token: string,
		fromDate?: string,
	) {
		const playlist = await getSpotifyPlaylist(userId, token);

		if (!playlist) {
			logger.warn("updateNewReleases:No playlist found for user:", userId);
			return;
		}

		return await updateUserPlaylist({
			userId,
			token,
			playlist,
			fromDate,
		});
	}

	async function updatePlaylistsForAllUsers(fromDate?: string) {
		try {
			const users = await repository.getAllUsers();

			if (!users || users.length === 0) {
				logger.warn(
					"updatePlaylistsForAllUsers:No users found for updating playlists.",
				);
				return;
			}

			logger.info(
				`updatePlaylistsForAllUsers:Updating playlists for ${users.length} users.`,
			);

			const results = await Promise.allSettled(
				users.map(async (user) => {
					try {
						const token = await getValidToken(user);
						logger.info(
							`updatePlaylistsForAllUsers:token received for user ${user.userId}`,
							token,
						);

						return await updateNewReleases(user.userId, token, fromDate);
					} catch (error) {
						if (axios.isAxiosError(error)) {
							logger.error(
								`updatePlaylistsForAllUsers:Error updating playlist for user ${user.userId}:`,
								{
									status: error.response?.status,
									message: error.response?.data || error.message,
								},
							);
						} else {
							logger.error(
								"updatePlaylistsForAllUsers:An unexpected error occurred while updating user playlist:",
								error,
							);
						}
						return null;
					}
				}),
			);

			const successfulUpdates = results.filter(
				(result) => result?.status === "fulfilled",
			);
			const errors = results.filter((result) => result?.status === "rejected");

			logger.info(
				`updatePlaylistsForAllUsers:Successful updates: ${successfulUpdates.length}`,
			);

			if (errors.length > 0) {
				logger.error(
					`updatePlaylistsForAllUsers:Failed updates: ${errors.length}`,
				);
			}

			return results;
		} catch (error) {
			logger.error(
				"updatePlaylistsForAllUsers:Error in updating playlists:",
				error,
			);
		}
	}

	return {
		initialize,
		shutdown,
		callbackHandler,
		getTokens,
		getUser,
		saveUser,
		refreshToken,
		saveArtists,
		removeSavedArtist,
		getAllArtistsIds,
		getSpotifyArtists,
		fetchNewReleases,
		updateNewReleases,
		updatePlaylistsForAllUsers,
		getSpotifyPlaylist,
	};
}
