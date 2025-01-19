import axios, { type AxiosResponse } from "axios";
import createHttpError from "http-errors";

import type {
	ArtistAlbumsI,
	FollowedArtistsI,
	NewReleasesI,
	SavedArtistI,
} from "@model/spotify";
import type { SpotifyPlaylistI } from "@model/spotify/playlist";
import type { Artist, SearchResponse } from "@model/spotify/search";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import type { SpotifyUserProfile, User } from "@model/spotify/user";
import type { SpotifyServiceI } from "@server/container/types";
import { resolvePath } from "@server/utils/resolvePath";
import { parseISO } from "date-fns";
import dotenv from "dotenv";
import { SPOTIFY_API_TOKEN, SPOTIFY_API_URL } from "../utils/constants";
import type { UpdateUserPlaylistI } from "./types";

const envPath = resolvePath("../../.env");
dotenv.config({ path: envPath });

export function SpotifyService({ repository, env }: SpotifyServiceI) {
	async function initialize(): Promise<void> {
		await repository.connect();
	}

	async function shutdown(): Promise<void> {
		await repository.disconnect();
	}

	async function callbackHandler(code: string) {
		const tokens = await getTokens(code);
		const userProfile = await getSpotifyUserProfile(tokens.access_token);

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
		console.log("Tokens fetched from Spotify.", {
			expires: data.expires_in,
			redirect_uri: `${env.SERVER_URL}/api/callback`,
		});

		return {
			access_token,
			refresh_token,
			frontend_uri: env.FRONTEND_URL,
		};
	}

	async function getSpotifyUserProfile(access_token: string) {
		const { data } = await axios.get<SpotifyUserProfile>(
			`${SPOTIFY_API_URL}/me`,
			{
				headers: { Authorization: `Bearer ${access_token}` },
			},
		);

		return data;
	}

	async function getUser(userId: string) {
		return await repository.getUser(userId);
	}

	async function saveUser(user: User) {
		const result = await repository.saveUser(user);

		console.log("User saved in MongoDB.", result);
		return result;
	}

	async function validateToken(token: string) {
		return await axios.get(`${SPOTIFY_API_URL}/me`, {
			headers: { Authorization: `Bearer ${token}` },
		});
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
			await validateToken(user.access_token);
			return user.access_token;
		} catch {
			const { data } = await refreshToken(user.refresh_token);
			user.access_token = data.access_token;
			await saveUser(user);
			console.log("Token refreshed.");
			return data.access_token;
		}
	}

	async function searchItem(
		token: string,
		query: string,
		type: Array<string>,
		limit: number,
	): Promise<SearchResponse> {
		const { data } = await axios.get(
			`${SPOTIFY_API_URL}/search?q=${query}&type=${type.join(",")}&limit=${limit}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);
		if (!data) {
			createHttpError(404, "No data found.");
		}

		return data;
	}

	async function getSavedTracks(token: string) {
		const { data } = await axios.get(`${SPOTIFY_API_URL}/me/tracks`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!data) {
			createHttpError(404, "No saved tracks found.");
		}

		console.log("Saved tracks fetched from Spotify.", data);
		return data;
	}

	async function saveArtists(userId: string, artists: Array<Artist>) {
		if (artists.length === 0) {
			console.log("No artists to save.");
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

		console.log(`${artists.length} artists added/updated in the database.`);
		return result;
	}

	async function getFollowedArtists(token: string): Promise<Array<Artist>> {
		let artists: Array<Artist> = [];

		let nextUrl: string | null =
			`${SPOTIFY_API_URL}/me/following?type=artist&limit=50`;

		while (nextUrl) {
			const { data }: AxiosResponse<FollowedArtistsI> = await axios.get(
				nextUrl,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			artists = artists.concat(data.artists.items);
			nextUrl = data.artists.next;
		}

		console.log(`${artists.length} followed artists fetched from spotify.`);
		return artists;
	}

	async function getSingleArtist(token: string, id: string) {
		const { data } = await axios.get(`${SPOTIFY_API_URL}/artists/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!data) {
			createHttpError(404, "No artist found.");
		}

		console.log("Single artist fetched from spotify.", {
			id: data.id,
			name: data.name,
		});
		return data;
	}

	async function removeSavedArtist(userId: string, id: string) {
		const result = await repository.removeSavedArtist(userId, id);

		console.log(`Removed artist with id: ${id} from the database.`);
		return result;
	}

	async function getAllArtistsIds(
		userId: string,
	): Promise<Array<SavedArtistI>> {
		const savedArtists = await repository.getAllArtists(userId);
		console.log(
			`Fetched ${savedArtists.length} saved artists for user ${userId}.`,
		);

		if (!savedArtists) {
			createHttpError(404, `No saved artists found for user ${userId}.`);
		}

		return savedArtists;
	}

	async function getAlbumTracks(token: string, albumId: string) {
		const { data } = await axios.get(
			`${SPOTIFY_API_URL}/albums/${albumId}/tracks`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		const tracks = data.items.map((track: { uri: string }) => track.uri);
		console.log("getAlbumTracks:Album tracks returned - ", tracks);
		return tracks;
	}

	async function getArtistAlbums(
		token: string,
		artistId: string,
		fromDate?: string,
	) {
		try {
			const { data } = await axios.get<ArtistAlbumsI>(
				`${SPOTIFY_API_URL}/artists/${artistId}/albums`,
				{
					headers: { Authorization: `Bearer ${token}` },
					params: { include_groups: "single,album,appears_on", limit: 4 },
				},
			);

			console.log(`Releases fetched for ${artistId}:`, data.total);

			const today = new Date().toISOString().split("T")[0];
			const filteredAlbums = data.items
				.filter(({ release_date }) => {
					return fromDate
						? parseISO(release_date) >= parseISO(fromDate)
						: release_date === today;
				})
				.map((props) => ({
					id: props.id,
					uri: props.uri,
					artists: props.artists.map(({ name, id, external_urls }) => ({
						name,
						id,
						url: external_urls.spotify,
					})),
					name: props.name,
					image: props.images[0].url,
					url: props.external_urls.spotify,
				}));

			return filteredAlbums;
		} catch (error) {
			console.log(
				"getNewReleasesForArtist:No releases found for artist. -",
				error,
			);
			throw new Error("No releases found for artist.");
		}
	}

	async function fetchNewReleases(
		userId: string,
		token: string,
		fromDate?: string,
	) {
		const artists = await repository.getAllArtists(userId);
		if (!artists || artists.length === 0) {
			console.log("No artists found for user:", userId);
			return [];
		}

		console.log(`${artists.length} Artists retrieved from MongoDB.`);

		const releasesArray = await Promise.all(
			artists.map((artist) => getArtistAlbums(token, artist.id, fromDate)),
		);

		return releasesArray.flat();
	}

	async function addTracksToPlaylist(
		token: string,
		playlistId: string,
		trackUris: Array<string>,
	) {
		const { data } = await axios.post(
			`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
			{ uris: trackUris },
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (data.snapshot_id) {
			console.log(`Added ${trackUris.length} tracks to playlist.`);
			return { tracks: trackUris };
		}

		console.error("Failed to add tracks to playlist.");
		return data;
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

		if (newReleases.length === 0) {
			console.log(`No new releases found for ${userId}`);
			return [];
		}

		const trackUris = (
			await Promise.all(
				newReleases.map(async ({ uri, id }) => {
					if (uri.includes("album")) {
						return await getAlbumTracks(token, id);
					}
					return uri;
				}),
			)
		).flat();

		const result = await addTracksToPlaylist(token, playlist.id, trackUris);
		return result;
	}

	async function createSpotifyPlaylist(token: string) {
		const { data: userProfile } = await axios.get(`${SPOTIFY_API_URL}/me`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		const userId = userProfile.id;

		const { data: playlist } = await axios.post<SpotifyPlaylistI>(
			`${SPOTIFY_API_URL}/users/${userId}/playlists`,
			{
				name: "New Music Releases",
				description: "A playlist of today's new releases.",
				public: true,
			},
			{ headers: { Authorization: `Bearer ${token}` } },
		);

		console.log("Playlist created in Spotify:", playlist);
		return playlist;
	}

	async function getSpotifyPlaylist(userId: string, token: string) {
		const existingPlaylist = await repository.getPlaylist(userId);
		if (existingPlaylist) {
			console.log("Playlist found in MongoDB:", existingPlaylist.name);
			return existingPlaylist;
		}

		console.log(`No playlist found in MongoDB for ${userId}`);
		const newPlaylist = await createSpotifyPlaylist(token);

		if (newPlaylist) {
			const res = await repository.createPlaylist(userId, newPlaylist);
			if (res.acknowledged) {
				console.log("Playlist created in MongoDB:", newPlaylist.name);
				return newPlaylist;
			}
		}
		return null;
	}

	async function getSpotifyPlaylistItems(token: string, playlistId: string) {
		const { data: playlistItems } = await axios.get<PlaylistTracksI>(
			`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		return playlistItems;
	}

	async function updateNewReleases(
		userId: string,
		token: string,
		fromDate?: string,
	) {
		const playlist = await getSpotifyPlaylist(userId, token);

		if (!playlist) {
			console.log("No playlist found for user:", userId);
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
				console.log("No users found for updating playlists.");
				return;
			}

			console.log(`Updating playlists for ${users.length} users.`);

			const results = await Promise.all(
				users.map(async (user) => {
					try {
						const token = await getValidToken(user);
						console.log(`token received for user ${user.userId}`, { token });

						return await updateNewReleases(user.userId, token, fromDate);
					} catch (error) {
						console.error(
							`Error updating playlist for user ${user.userId}:`,
							(error as Error).message,
						);
						return null;
					}
				}),
			);

			const successfulUpdates = results.filter(
				(result) => result?.status === "fulfilled",
			);
			const errors = results.filter((result) => result?.status === "rejected");

			console.log(`Successful updates: ${successfulUpdates.length}`);
			console.error(`Failed updates: ${errors.length}`);

			return results;
		} catch (error) {
			console.error("Error in updating playlists:", error);
		}
	}

	return {
		initialize,
		shutdown,
		callbackHandler,
		getTokens,
		getSpotifyUserProfile,
		getUser,
		saveUser,
		refreshToken,
		validateToken,
		// Artists
		getFollowedArtists,
		saveArtists,
		getSingleArtist,
		removeSavedArtist,
		getAllArtistsIds,
		// Tracks
		searchItem,
		getSavedTracks,
		getAlbumTracks,
		fetchNewReleases,
		addTracksToPlaylist,
		updateNewReleases,
		updatePlaylistsForAllUsers,
		// Playlist
		createSpotifyPlaylist,
		getSpotifyPlaylist,
		getSpotifyPlaylistItems,
	};
}
