import { SpotifyRepository } from "@server/repository/spotify.repository.ts";
import { logError } from "@server/utils/logger.ts";
import axios, { type AxiosResponse } from "axios";
import dotenv from "dotenv";
import type {
	ArtistAlbumsI,
	ArtistI,
	FollowedArtistsI,
	NewReleasesI,
} from "src/types/spotify.ts";
import { SPOTIFY_API_URL } from "src/utils/constants.ts";

dotenv.config();

const {
	MONGO_URI,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_REFRESH_TOKEN,
} = process.env;

export function SpotifyService() {
	if (
		!MONGO_URI ||
		!SPOTIFY_CLIENT_ID ||
		!SPOTIFY_CLIENT_SECRET ||
		!SPOTIFY_REFRESH_TOKEN
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

	async function getAuthToken() {
		const token = await repository.getToken();
		if (token && new Date(token.expires_at) > new Date()) {
			return token.access_token;
		}

		console.error("No token found.");

		const { data } = await axios.post(
			"https://accounts.spotify.com/api/token",
			new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: SPOTIFY_REFRESH_TOKEN as string,
			}),
			{
				headers: {
					Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
			},
		);
		await repository.setToken(data.expires_in, data.access_token);
		return data.access_token;
	}

	async function searchItem(query: string, type: Array<string>, limit: number) {
		try {
			const token = await getAuthToken();
			const { data } = await axios.get(
				`https://api.spotify.com/v1/search?q=${query}&type=${type.join(",")}&limit=${limit}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			console.log("Search results fetched from Spotify.", data);
			return data;
		} catch (error: unknown) {
			logError(error);
			return { total: 0, items: [] };
		}
	}

	async function fetchAndSaveArtists(artists: Array<ArtistI>) {
		try {
			if (artists.length === 0) {
				console.log("No artists to save.");
				return null;
			}

			const result = await repository.fetchAndSaveArtists(artists);
			console.log(`${artists.length} artists added/updated in the database.`);
			return result;
		} catch (error) {
			logError(error);
			return null;
		}
	}

	async function resetArtists(artists: Array<ArtistI>) {
		try {
			if (artists.length === 0) {
				console.log("No artists to save after reset.");
				return null;
			}

			const result = await repository.resetArtists(artists);
			console.log(
				`${artists.length} artists were overwritten in the database.`,
			);
			return result;
		} catch (error) {
			logError(error);
			return null;
		}
	}

	async function getFollowedArtists() {
		let artists: Array<ArtistI> = [];

		try {
			const token = await getAuthToken();

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

			return artists.map(({ id, name, uri }) => ({ id, name, uri }));
		} catch (error) {
			logError(error);
			return artists;
		}
	}

	async function getSingleArtist(id: string) {
		try {
			const token = await getAuthToken();

			const { data } = await axios.get(`${SPOTIFY_API_URL}/artists/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			console.log("One artist fetched from spotify.", data);

			return data;
		} catch (error: unknown) {
			logError(error);
			return null;
		}
	}

	async function removeSavedArtist(id: string) {
		try {
			const result = await repository.removeSavedArtist(id);
			console.log(`Removed artist with id: ${id} from the database.`);
			return result;
		} catch (error) {
			logError(error);
			return null;
		}
	}

	async function getAllArtistsIds() {
		try {
			const savedArtists = await repository.getAllArtists();
			console.log(`Fetched ${savedArtists.length} saved artists.`);
			return savedArtists;
		} catch (error) {
			logError(error);
			return [];
		}
	}

	async function getAlbumTracks(albumId: string) {
		try {
			const token = await getAuthToken();

			const { data } = await axios.get(
				`${SPOTIFY_API_URL}/albums/${albumId}/tracks`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			const tracks = data.items.map((track: { uri: string }) => track.uri);
			console.log("Album tracks returned:", tracks);
			return tracks;
		} catch (error: unknown) {
			logError(error);
			return null;
		}
	}

	async function getNewReleasesForArtist(artistId: string) {
		try {
			const token = await getAuthToken();

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
		} catch (error: unknown) {
			logError(error);
			return [];
		}
	}

	async function fetchNewReleases() {
		const newReleases: Array<NewReleasesI> = [];

		try {
			const artists = await repository.getAllArtists();

			console.log(`${artists.length} Artists retrieved from MongoDB.`);
			for (const artist of artists) {
				const releases = await getNewReleasesForArtist(artist.id);
				for (const release of releases) {
					newReleases.push(release);
				}
			}

			return newReleases;
		} catch (error) {
			logError(error);
			return [];
		}
	}
	async function addTracksToPlaylist(
		playlistId: string,
		trackUris: Array<string>,
	) {
		try {
			const token = await getAuthToken();

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
				return data;
			}

			console.log(`Added ${data.length} tracks to playlist.`);
			return data;
		} catch (error: unknown) {
			logError(error);
			return null;
		}
	}

	async function createSpotifyPlaylist() {
		try {
			const token = await getAuthToken();

			const { data: userProfile } = await axios.get(`${SPOTIFY_API_URL}/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			const userId = userProfile.id;

			const { data: playlist } = await axios.post(
				`${SPOTIFY_API_URL}/users/${userId}/playlists`,
				{
					name: "New Music Releases",
					description: "A playlist of today's new releases.",
					public: true,
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			console.log("Playlist created in Spotify:", playlist);

			return { id: playlist.id, name: playlist.name };
		} catch (error) {
			logError(error);
			return null;
		}
	}

	async function getSpotifyPlaylist() {
		try {
			const existingPlaylist = await repository.getPlaylist();
			if (existingPlaylist) {
				console.log("Playlist found in MongoDB:", existingPlaylist.name);
				return existingPlaylist;
			}

			const newPlaylist = await createSpotifyPlaylist();

			if (newPlaylist) {
				await repository.createPlaylist(newPlaylist);
			}
			return null;
		} catch (error) {
			logError(error);
			return null;
		}
	}

	return {
		initialize,
		shutdown,
		getAuthToken,
		searchItem,
		// Artists
		getFollowedArtists,
		fetchAndSaveArtists,
		resetArtists,
		getSingleArtist,
		removeSavedArtist,
		getAllArtistsIds,
		// Tracks
		getAlbumTracks,
		getNewReleasesForArtist,
		fetchNewReleases,
		addTracksToPlaylist,
		// Playlist
		createSpotifyPlaylist,
		getSpotifyPlaylist,
	};
}
