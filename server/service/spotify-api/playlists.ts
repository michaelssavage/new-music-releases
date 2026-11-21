import type { PlaylistSummaryI } from "@model/playlist-settings";
import type { SavedTrackToPlaylistI } from "@model/spotify/playlist";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import type { SpotifyUserProfile } from "@model/spotify/user";
import type { SaveSongToPlaylistI } from "@server/service/types";
import { SPOTIFY_API_URL } from "@server/utils/constants";
import { getRequest, postRequest, putRequest } from "@server/utils/fetch";
import { logger } from "@server/utils/logger";

const PLAYLIST_TRACKS_PAGE_SIZE = 100;
const USER_PLAYLISTS_PAGE_SIZE = 50;
const PLAYLIST_SUMMARY_FIELDS = "id,name,external_urls,owner(id)";

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

  async function createPlaylist(
    token: string,
    { name, description }: { name: string; description?: string },
  ) {
    const { data: userProfile } = await getRequest<SpotifyUserProfile>(
      `${SPOTIFY_API_URL}/me`,
      token,
    );

    const { data: playlist } = await postRequest<PlaylistSummaryI>(
      `${SPOTIFY_API_URL}/users/${userProfile.id}/playlists`,
      token,
      { name, description, public: true },
    );

    logger.info("createPlaylist:Playlist created in Spotify:", playlist.name);
    return playlist;
  }

  async function renamePlaylist(
    token: string,
    playlistId: string,
    name: string,
  ) {
    await putRequest(`${SPOTIFY_API_URL}/playlists/${playlistId}`, token, {
      name,
    });
    logger.info("renamePlaylist:Playlist renamed in Spotify:", {
      playlistId,
      name,
    });
  }

  async function fetchPlaylist(token: string, playlistId: string) {
    const { data } = await getRequest<PlaylistSummaryI>(
      `${SPOTIFY_API_URL}/playlists/${playlistId}`,
      token,
      { fields: PLAYLIST_SUMMARY_FIELDS },
    );
    return data;
  }

  async function fetchUserPlaylists(token: string) {
    const playlists: Array<PlaylistSummaryI> = [];
    let nextUrl: string | null =
      `${SPOTIFY_API_URL}/me/playlists?limit=${USER_PLAYLISTS_PAGE_SIZE}`;

    while (nextUrl) {
      const res: {
        data: { items: Array<PlaylistSummaryI>; next: string | null };
      } = await getRequest(nextUrl, token);
      playlists.push(...res.data.items);
      nextUrl = res.data.next;
    }

    return playlists;
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

  /** Reads from the tail, newest first, until a page reaches a track added before `since` (default: the day of the newest track). */
  async function fetchPlaylistTracksAddedSince(
    token: string,
    playlistId: string,
    since?: string,
  ) {
    const tracksUrl = `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`;
    const { data: summary } = await getRequest<Pick<PlaylistTracksI, "total">>(
      tracksUrl,
      token,
      { fields: "total", limit: 1 },
    );

    const addedDay = ({ added_at }: PlaylistTracksI["items"][number]) =>
      added_at.slice(0, 10);
    const items: PlaylistTracksI["items"] = [];
    let cutoffDay = since;

    for (let end = summary.total; end > 0; end -= PLAYLIST_TRACKS_PAGE_SIZE) {
      const start = Math.max(0, end - PLAYLIST_TRACKS_PAGE_SIZE);
      const { data } = await getRequest<PlaylistTracksI>(tracksUrl, token, {
        offset: start,
        limit: end - start,
      });

      const page = data.items.reverse();
      items.push(...page);
      cutoffDay ??= addedDay(page[0]);
      const cutoff = cutoffDay;
      if (page.some((item) => addedDay(item) < cutoff)) break;
    }

    return { items };
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
    createPlaylist,
    renamePlaylist,
    fetchPlaylist,
    fetchUserPlaylists,
    fetchPlaylistTracks,
    fetchPlaylistTracksAddedSince,
    fetchPlaylistTracksNewestFirst,
  };
}
