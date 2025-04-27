import type { ArtistAlbumsI, FollowedArtistsI } from "@model/spotify";
import type { SpotifyPlaylistI } from "@model/spotify/playlist";
import type { SearchResponse } from "@model/spotify/search";
import type { Artist } from "@model/spotify/search";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import type { SpotifyUserProfile } from "@model/spotify/user";
import { SPOTIFY_API_URL } from "@server/utils/constants";
import axios, { type AxiosResponse } from "axios";
import createHttpError from "http-errors";
import type { SaveSongToPlaylistI } from "./types";

export function SpotifyApi() {
	async function validateToken(token: string) {
		return await axios.get(`${SPOTIFY_API_URL}/me`, {
			headers: { Authorization: `Bearer ${token}` },
		});
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
					if (!fromDate) return release_date === today;

					const releaseTimestamp = new Date(release_date).getTime();
					const fromTimestamp = new Date(fromDate).getTime();

					return releaseTimestamp >= fromTimestamp;
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

	async function getRecommendations(
		token: string,
		seedArtists: string[],
		limit: number,
	) {
		const { data } = await axios.get(
			`${SPOTIFY_API_URL}/recommendations?seed_artists=${seedArtists.join(
				",",
			)}&limit=${limit}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (!data) {
			createHttpError(404, "No recommendations found.");
		}

		return data;
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

	async function getSpotifyPlaylistItems(token: string, playlistId: string) {
		const { data: playlistItems } = await axios.get<PlaylistTracksI>(
			`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		return playlistItems;
	}

	async function saveSongToPlaylist({
		spotifyAccessToken,
		trackId,
		playlistId,
	}: SaveSongToPlaylistI) {
		const { data: playlistItems } = await axios.post(
			`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
			{
				uris: [`spotify:track:${trackId}`],
			},
			{
				headers: {
					Authorization: `Bearer ${spotifyAccessToken}`,
					"Content-Type": "application/json",
				},
			},
		);

		return playlistItems;
	}

	return {
		getArtistAlbums,
		getRecommendations,
		getSpotifyUserProfile,
		validateToken,
		searchItem,
		getSingleArtist,
		addTracksToPlaylist,
		getAlbumTracks,
		getSavedTracks,
		getFollowedArtists,
		createSpotifyPlaylist,
		getSpotifyPlaylistItems,
		saveSongToPlaylist,
	};
}
