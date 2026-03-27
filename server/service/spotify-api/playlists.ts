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

export function createPlaylistsApi() {
  async function appendTracksToPlaylist(
    token: string,
    playlistId: string,
    trackUris: Array<string>,
  ) {
    const res = await postRequest<SavedTrackToPlaylistI>(
      `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
      token,
      {
        uris: trackUris,
      },
    );

    if (res.data.snapshot_id) {
      logger.info(
        `appendTracksToPlaylist:Added ${trackUris.length} new track${trackUris.length !== 1 && "s"} to playlist.`,
        {
          playlistId,
          trackUris,
        },
      );
      const data = { tracks: trackUris };
      return { data, status: res.status };
    }

    logger.error("appendTracksToPlaylist:Failed to add tracks to playlist.", {
      playlistId,
      trackUris,
    });
    return res;
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

  return {
    appendTracksToPlaylist,
    addTrackToPlaylistById,
    createReleasesPlaylist,
    fetchPlaylistTracks,
  };
}
