import path from "node:path";
import { fileURLToPath } from "node:url";
import axios, { type AxiosResponse } from "axios";
import dotenv from "dotenv";
import createHttpError from "http-errors";

import type {
	ArtistAlbumsI,
	FollowedArtistsI,
	NewReleasesI,
} from "@model/spotify";
import type { SpotifyPlaylistI } from "@model/spotify/playlist";
import type {
	Artist,
	SavedArtistI,
	SearchResponse,
} from "@model/spotify/search";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import type { SpotifyUserProfile, User } from "@model/spotify/user";
import { SpotifyRepository } from "../repository/spotify.repository";
import { SPOTIFY_API_TOKEN, SPOTIFY_API_URL } from "../utils/constants";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const {
	MONGO_URI,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_REFRESH_TOKEN,
	SERVER_URL,
	FRONTEND_URL,
} = process.env;

export function SpotifyService() {
	if (
		!MONGO_URI ||
		!SPOTIFY_CLIENT_ID ||
		!SPOTIFY_CLIENT_SECRET ||
		!SPOTIFY_REFRESH_TOKEN ||
		!SERVER_URL ||
		!FRONTEND_URL
	) {
		throw new Error("Missing environment variables.");
	}

	const repository = SpotifyRepository(MONGO_URI as string);

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
				redirect_uri: `${SERVER_URL}/api/callback`,
				client_id: `${SPOTIFY_CLIENT_ID}`,
				client_secret: `${SPOTIFY_CLIENT_SECRET}`,
			}),
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } },
		);

		const { access_token, refresh_token } = data;
		console.log("Tokens fetched from Spotify.", {
			expires: data.expires_in,
			redirect_uri: `${SERVER_URL}/api/callback`,
		});

		return {
			access_token,
			refresh_token,
			frontend_uri: FRONTEND_URL,
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
				client_id: SPOTIFY_CLIENT_ID as string,
				client_secret: SPOTIFY_CLIENT_SECRET as string,
			}),
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } },
		);
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
		console.log("Search results fetched from Spotify.", data);
		if (!data) {
			createHttpError(404, "No data found.");
		}
		return data;
	}

	async function getSavedTracks(token: string) {
		const { data } = await axios.get(`${SPOTIFY_API_URL}/me/tracks`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		console.log("Saved tracks fetched from Spotify.", data);
		if (!data) {
			createHttpError(404, "No saved tracks found.");
		}
		return data;
	}

	async function fetchAndSaveArtists(userId: string, artists: Array<Artist>) {
		if (artists.length === 0) {
			console.log("No artists to save.");
			return null;
		}

		const result = await repository.fetchAndSaveArtists(userId, artists);
		console.log(`${artists.length} artists added/updated in the database.`);
		return result;
	}

	async function resetArtists(userId: string, artists: Array<SavedArtistI>) {
		if (artists.length === 0) {
			console.log("No artists to save after reset.");
			return null;
		}

		const result = await repository.resetArtists(userId, artists);
		console.log(`${artists.length} artists were overwritten in the database.`);
		return result;
	}

	async function getFollowedArtists(
		token: string,
	): Promise<Array<SavedArtistI>> {
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

		console.log(`${artists} followed artists fetched from spotify.`);

		return artists.map(({ id, name, uri, external_urls, images }) => ({
			id,
			name,
			uri,
			url: external_urls.spotify,
			images: images?.[0]?.url,
		}));
	}

	async function getSingleArtist(token: string, id: string) {
		const { data } = await axios.get(`${SPOTIFY_API_URL}/artists/${id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		console.log("Single artist fetched from spotify.", data);

		if (!data) {
			createHttpError(404, "No artist found.");
		}
		return data;
	}

	async function removeSavedArtist(userId: string, id: string) {
		const result = await repository.removeSavedArtist(userId, id);
		console.log(`Removed artist with id: ${id} from the database.`);
		return result;
	}

	async function getAllArtistsIds(userId: string) {
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
		console.log("Album tracks returned:", tracks);
		return tracks;
	}

	async function getNewReleasesForArtist(token: string, artistId: string) {
		const { data }: AxiosResponse<ArtistAlbumsI> = await axios.get(
			`${SPOTIFY_API_URL}/artists/${artistId}/albums`,
			{
				headers: { Authorization: `Bearer ${token}` },
				params: { include_groups: "single,album,appears_on", limit: 10 },
			},
		);

		const today = new Date().toISOString().split("T")[0];
		return data.items
			.filter(({ release_date }) => release_date === today)
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
	}

	async function fetchNewReleases(userId: string, token: string) {
		const newReleases: Array<NewReleasesI> = [];

		const artists = await repository.getAllArtists(userId);

		console.log(`${artists.length} Artists retrieved from MongoDB.`);
		for (const artist of artists) {
			const releases = await getNewReleasesForArtist(token, artist.id);
			for (const release of releases) {
				newReleases.push(release);
			}
		}

		return newReleases;
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

	async function updateSpotifyPlaylistReleases(
		userId: string,
		token: string,
		playlist: SpotifyPlaylistI,
	) {
		const newReleases: Array<NewReleasesI> = await fetchNewReleases(
			userId,
			token,
		);

		if (newReleases.length === 0) {
			console.log("No new releases found.");
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

		return await addTracksToPlaylist(token, playlist.id, trackUris);
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
		fetchAndSaveArtists,
		resetArtists,
		getSingleArtist,
		removeSavedArtist,
		getAllArtistsIds,
		// Tracks
		searchItem,
		getSavedTracks,
		getAlbumTracks,
		getNewReleasesForArtist,
		fetchNewReleases,
		addTracksToPlaylist,
		updateSpotifyPlaylistReleases,
		// Playlist
		createSpotifyPlaylist,
		getSpotifyPlaylist,
		getSpotifyPlaylistItems,
	};
}
