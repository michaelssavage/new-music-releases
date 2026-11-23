import type {
  PlaylistRole,
  PlaylistSettingsResponse,
  PlaylistSummaryI,
} from "@model/playlist-settings";
import type { User } from "@model/spotify/user";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import { HttpException } from "@server/utils/exceptions";
import { logger } from "@server/utils/logger";
import { resolvePath } from "@server/utils/resolvePath";
import { readFile } from "node:fs/promises";

type Repository = ReturnType<typeof SpotifyRepository>;

const DEFAULT_PLAYLISTS: Record<
  PlaylistRole,
  { name: string; description: string; coverPath?: string }
> = {
  releases: {
    name: "Cookie Jar",
    description: "A playlist of today's new releases.",
    coverPath: resolvePath("server/assets/cookie-jar-cover.jpg"),
  },
  tracker: {
    name: "Artist Tracker",
    description: "Artists to watch for new releases.",
  },
};

export const playlistIdFor = (user: User, role: PlaylistRole) =>
  role === "releases" ? user.releasesPlaylistId : user.trackerPlaylistId;

export function createPlaylistSettingsService(deps: {
  repository: Repository;
  api: SpotifyWebApi;
}) {
  const { repository, api } = deps;

  async function getPlaylistSettings(
    user: User,
    token: string,
  ): Promise<PlaylistSettingsResponse> {
    const load = async (role: PlaylistRole) => {
      const id = playlistIdFor(user, role);
      return id ? await api.fetchPlaylist(token, id) : null;
    };

    const [releases, tracker] = await Promise.all([
      load("releases"),
      load("tracker"),
    ]);
    return { releases, tracker };
  }

  async function listOwnedPlaylists(
    user: User,
    token: string,
  ): Promise<Array<PlaylistSummaryI>> {
    const playlists = await api.fetchUserPlaylists(token);
    return playlists.filter(({ owner }) => owner.id === user.userId);
  }

  async function selectPlaylist(
    user: User,
    token: string,
    role: PlaylistRole,
    playlistId: string,
  ) {
    const playlist = await api.fetchPlaylist(token, playlistId);
    if (playlist.owner.id !== user.userId) {
      throw new HttpException(403, "You can only use playlists you own");
    }
    await repository.setPlaylistId(user.userId, role, playlist.id);
  }

  async function ensurePlaylistId(
    user: User,
    token: string,
    role: PlaylistRole,
  ) {
    const existingId = playlistIdFor(user, role);
    if (existingId) return existingId;

    const { coverPath, ...details } = DEFAULT_PLAYLISTS[role];
    const playlist = await api.createPlaylist(token, details);
    await repository.setPlaylistId(user.userId, role, playlist.id);
    logger.info(
      `ensurePlaylistId:Created ${role} playlist for ${user.userId}:`,
      playlist.name,
    );
    if (coverPath) await setCover(token, playlist.id, coverPath);
    return playlist.id;
  }

  // The cover is cosmetic, and users who logged in before ugc-image-upload was added lack the scope.
  async function setCover(token: string, playlistId: string, path: string) {
    try {
      const jpeg = await readFile(path);
      await api.uploadPlaylistCover(token, playlistId, jpeg.toString("base64"));
    } catch (error) {
      logger.warn("setCover:Could not upload playlist cover:", {
        playlistId,
        error,
      });
    }
  }

  async function renamePlaylist(
    user: User,
    token: string,
    role: PlaylistRole,
    name: string,
  ) {
    const playlistId = playlistIdFor(user, role);
    if (!playlistId) throw new HttpException(409, "No playlist selected yet");
    await api.renamePlaylist(token, playlistId, name);
  }

  return {
    getPlaylistSettings,
    listOwnedPlaylists,
    selectPlaylist,
    ensurePlaylistId,
    renamePlaylist,
  };
}
