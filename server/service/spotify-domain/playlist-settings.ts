import type {
  PlaylistRole,
  PlaylistSettingsResponse,
  PlaylistSummaryI,
} from "@model/playlist-settings";
import type { User } from "@model/spotify/user";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import { HttpException } from "@server/utils/exceptions";

type Repository = ReturnType<typeof SpotifyRepository>;

const NEW_PLAYLIST_DESCRIPTIONS: Record<PlaylistRole, string> = {
  releases: "A playlist of today's new releases.",
  tracker: "Artists to watch for new releases.",
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

  async function createAndSelectPlaylist(
    user: User,
    token: string,
    role: PlaylistRole,
    name: string,
  ) {
    const playlist = await api.createPlaylist(token, {
      name,
      description: NEW_PLAYLIST_DESCRIPTIONS[role],
    });
    await repository.setPlaylistId(user.userId, role, playlist.id);
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
    createAndSelectPlaylist,
    renamePlaylist,
  };
}
