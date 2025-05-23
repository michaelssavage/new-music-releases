import type { ArtistAlbumsI, FollowedArtistsI } from "@model/spotify";
import type { LikedTracksI } from "@model/spotify/liked-tracks";
import type { Artist } from "@model/spotify/liked-tracks";
import type {
	SavedTrackToPlaylistI,
	SpotifyPlaylistI,
} from "@model/spotify/playlist";
import type { SearchResponse } from "@model/spotify/search";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import type { SpotifyUserProfile } from "@model/spotify/user";
import { SPOTIFY_API_URL } from "@server/utils/constants";
import { getRequest, postRequest } from "@server/utils/fetch";
import { logger } from "@server/utils/logger";
import axios from "axios";
import createHttpError from "http-errors";
import type { SaveSongToPlaylistI } from "./types";

export function SpotifyApi() {
	async function validateToken(token: string) {
		const { status } = await getRequest(`${SPOTIFY_API_URL}/me`, token);
		return status;
	}

	async function getSpotifyUserProfile(access_token: string) {
		const { data } = await getRequest<SpotifyUserProfile>(
			`${SPOTIFY_API_URL}/me`,
			access_token,
		);

		return data;
	}

	async function getArtistAlbums(
		token: string,
		artistId: string,
		fromDate?: string,
	) {
		const maxRetries = 3;
		let attempt = 0;

		while (attempt < maxRetries) {
			try {
				const { data } = await getRequest<ArtistAlbumsI>(
					`${SPOTIFY_API_URL}/artists/${artistId}/albums`,
					token,
					{ include_groups: "single,album,appears_on", limit: 4 },
				);

				logger.info(
					`getArtistAlbums:Releases fetched for ${artistId}:`,
					data.total,
				);

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
				if (axios.isAxiosError(error)) {
					if (error.response?.status === 429) {
						const retryAfter = error.response.headers["retry-after"];
						const waitTime =
							(retryAfter ? Number.parseInt(retryAfter, 10) : 1) * 1000;
						console.warn(`Rate limited. Retrying after ${waitTime}ms...`);
						await new Promise((resolve) => setTimeout(resolve, waitTime));
					} else if (error.response && error.response?.status >= 500) {
						console.warn(`Server error. Retrying attempt ${attempt + 1}...`);
						await new Promise((resolve) =>
							setTimeout(resolve, 1000 * (attempt + 1)),
						);
					} else {
						throw error;
					}
				} else {
					throw error;
				}
			}
			attempt++;
		}

		throw new Error(
			`Failed to fetch albums for artist ${artistId} after ${maxRetries} attempts.`,
		);
	}

	async function getRecommendations(
		token: string,
		seedArtists: string[],
		limit: number,
	) {
		const stringifiedArtists = seedArtists.join(",");

		const data = await getRequest(
			`${SPOTIFY_API_URL}/recommendations?seed_artists=${stringifiedArtists}&limit=${limit}`,
			token,
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
		const { data } = await getRequest<SearchResponse>(
			`${SPOTIFY_API_URL}/search?q=${query}&type=${type.join(",")}&limit=${limit}`,
			token,
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
			const { data }: { data: FollowedArtistsI } =
				await getRequest<FollowedArtistsI>(nextUrl, token);
			artists = artists.concat(data.artists.items);
			nextUrl = data.artists.next;
		}

		logger.info(
			`getFollowedArtists:${artists.length} followed artists fetched from spotify.`,
		);
		return artists;
	}

	async function getSavedTracks(token: string) {
		const { data } = await getRequest<LikedTracksI>(
			`${SPOTIFY_API_URL}/me/tracks`,
			token,
		);
		if (!data) {
			createHttpError(404, "No saved tracks found.");
		}

		logger.info("getSavedTracks:Saved tracks fetched from Spotify.", data);
		return data;
	}

	async function getSingleArtist(token: string, id: string) {
		const { data } = await getRequest<Artist>(
			`${SPOTIFY_API_URL}/artists/${id}`,
			token,
		);

		if (!data) {
			createHttpError(404, "No artist found.");
		}

		logger.info("getSingleArtist:Single artist fetched from spotify.", {
			id: data.id,
			name: data.name,
		});
		return data;
	}

	async function getAlbumTracks(token: string, albumId: string) {
		const { data } = await getRequest<ArtistAlbumsI>(
			`${SPOTIFY_API_URL}/albums/${albumId}/tracks`,
			token,
		);

		const tracks = data.items.map((track: { uri: string }) => track.uri);
		logger.info("getAlbumTracks:Album tracks returned - ", tracks);
		return tracks;
	}

	async function addTracksToPlaylist(
		token: string,
		playlistId: string,
		trackUris: Array<string>,
	) {
		logger.info("addTracksToPlaylist:call post endpoint - ", {
			playlistId,
			trackUris: trackUris.length,
		});

		const res = await postRequest<SavedTrackToPlaylistI>(
			`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
			token,
			{
				uris: trackUris,
			},
		);

		if (res.data.snapshot_id) {
			logger.info(
				`addTracksToPlaylist:Added ${trackUris.length} tracks to playlist.`,
			);
			const data = { tracks: trackUris };
			return { data, status: res.status };
		}

		logger.error("addTracksToPlaylist:Failed to add tracks to playlist.");
		return res;
	}

	async function createSpotifyPlaylist(token: string) {
		const { data: userProfile } = await getRequest<SpotifyUserProfile>(
			`${SPOTIFY_API_URL}/me`,
			token,
		);

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

		logger.info("createSpotifyPlaylist:Playlist created in Spotify:", playlist);
		return playlist;
	}

	async function getSpotifyPlaylistItems(token: string, playlistId: string) {
		const playlistItems = await getRequest<PlaylistTracksI>(
			`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
			token,
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
