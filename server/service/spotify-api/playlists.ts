import type {
  SavedTrackToPlaylistI,
  SpotifyPlaylistI,
} from "@model/spotify/playlist";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import type { SpotifyUserProfile } from "@model/spotify/user";
import type { SaveSongToPlaylistI } from "@server/service/types";
import { SPOTIFY_API_URL } from "@server/utils/constants";
import { getRequest, postRequest } from "@server/utils/fetch";
import { logger } from "@server/utils/logger";
import axios from "axios";

export interface PlaylistPageParams {
  offset: number;
  limit: number;
}

/** Spotify appends new tracks to the end, so newest-first paging reads from the tail. */
export function newestFirstWindow(
  total: number,
  { offset, limit }: PlaylistPageParams,
) {
  const end = Math.max(0, total - offset);
  const start = Math.max(0, end - limit);
  return { start, count: end - start };
}

export function createPlaylistsApi() {
  async function appendTracksToPlaylist(
    token: string,
    playlistId: string,
    trackUris: Array<string>,
  ) {
    const snapshots: Array<SavedTrackToPlaylistI> = [];

    for (let index = 0; index < trackUris.length; index += 100) {
      const batch = trackUris.slice(index, index + 100);
      const res = await postRequest<SavedTrackToPlaylistI>(
        `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
        token,
        {
          uris: batch,
        },
      );

      if (!res.data.snapshot_id) {
        throw new Error(
          `Spotify did not return a snapshot after adding tracks to playlist ${playlistId}`,
        );
      }

      snapshots.push(res.data);
    }

    logger.info(
      `appendTracksToPlaylist:Added ${trackUris.length} new track${trackUris.length === 1 ? "" : "s"} to playlist.`,
      {
        playlistId,
        trackUris,
      },
    );

    return {
      data: { tracks: trackUris, snapshots },
      status: 201,
    };
  }

  async function addTrackToPlaylistById({
    spotifyAccessToken,
    trackId,
    playlistId,
  }: SaveSongToPlaylistI) {
    const res = await postRequest<SavedTrackToPlaylistI>(
      `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
      spotifyAccessToken,
      {
        uris: [`spotify:track:${trackId}`],
      },
    );
    return res.data;
  }

  async function createReleasesPlaylist(token: string) {
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

    logger.info(
      "createReleasesPlaylist:Playlist created in Spotify:",
      playlist.name,
    );
    return playlist;
  }

  async function fetchPlaylistTracks(token: string, playlistId: string) {
    let allItems: PlaylistTracksI["items"] = [];
    let nextUrl: string | null =
      `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks?limit=100`;

    while (nextUrl) {
      const res: { data: PlaylistTracksI } = await getRequest<PlaylistTracksI>(
        nextUrl,
        token,
      );

      if (res?.data?.items) {
        allItems = allItems.concat(res?.data.items);
        nextUrl = res?.data.next;
      } else {
        break;
      }
    }

    logger.info(
      "fetchPlaylistTracks:get all playlist items in Spotify:",
      allItems.length,
    );
    return { items: allItems };
  }

  async function fetchPlaylistTracksNewestFirst(
    token: string,
    playlistId: string,
    page: PlaylistPageParams,
  ) {
    const tracksUrl = `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`;

    const { data: summary } = await getRequest<Pick<PlaylistTracksI, "total">>(
      tracksUrl,
      token,
      { fields: "total", limit: 1 },
    );
    const { start, count } = newestFirstWindow(summary.total, page);
    if (count === 0) return { items: [], total: summary.total };

    const { data } = await getRequest<PlaylistTracksI>(tracksUrl, token, {
      offset: start,
      limit: count,
    });
    return { items: data.items.reverse(), total: summary.total };
  }

  return {
    appendTracksToPlaylist,
    addTrackToPlaylistById,
    createReleasesPlaylist,
    fetchPlaylistTracks,
    fetchPlaylistTracksNewestFirst,
  };
}
