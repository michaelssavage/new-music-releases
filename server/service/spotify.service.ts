import { PLAYLIST_ROLES } from "@model/playlist-settings";
import type { SpotifyServiceI } from "@server/container/types";
import { createLastFmApi } from "./lastfm-api";
import { createAccountsService } from "./spotify-domain/accounts";
import { createSpotifyOAuth } from "./spotify-domain/oauth";
import { createPlaylistSettingsService } from "./spotify-domain/playlist-settings";
import { createReleasesPlaylistService } from "./spotify-domain/releases-playlist";
import { createSeenArtistsService } from "./spotify-domain/seen-artists";
import { createTrackedArtistsService } from "./spotify-domain/tracked-artists";
import { createUserSession } from "./spotify-domain/user-session";

export function SpotifyService({ repository, env, api }: SpotifyServiceI) {
  const oauth = createSpotifyOAuth(env);
  const userSession = createUserSession({ repository, api, oauth });
  const accounts = createAccountsService({ repository, api });
  const playlistSettings = createPlaylistSettingsService({ repository, api });
  const trackedArtists = createTrackedArtistsService({
    repository,
    api,
    ensureValidAccessToken: userSession.ensureValidAccessToken,
  });
  const seenArtists = createSeenArtistsService({
    repository,
    lastFm: createLastFmApi({ apiKey: env.LASTFM_API_KEY }),
  });
  const releasesPlaylist = createReleasesPlaylistService({
    repository,
    api,
    ensureValidAccessToken: userSession.ensureValidAccessToken,
    ensurePlaylistId: playlistSettings.ensurePlaylistId,
  });

  async function completeOAuthLogin(code: string) {
    const login = await userSession.completeOAuthLogin(code);
    if (login.user.saved_artists.length === 0) {
      for (const role of PLAYLIST_ROLES) {
        await playlistSettings.ensurePlaylistId(
          login.user,
          login.access_token,
          role,
        );
      }
    }
    return login;
  }

  async function initialize(): Promise<void> {
    await repository.connect();
  }

  async function shutdown(): Promise<void> {
    await repository.disconnect();
  }

  return {
    initialize,
    shutdown,

    exchangeAuthorizationCode: oauth.exchangeAuthorizationCode,
    refreshAccessToken: oauth.refreshAccessToken,

    completeOAuthLogin,
    getUser: userSession.getUser,
    saveUser: userSession.saveUser,
    ensureValidAccessToken: userSession.ensureValidAccessToken,

    listUniqueArtistsFromLikedTracks:
      trackedArtists.listUniqueArtistsFromLikedTracks,
    persistTrackedArtists: trackedArtists.persistTrackedArtists,
    saveAllFollowedArtists: trackedArtists.saveAllFollowedArtists,
    removeTrackedArtist: trackedArtists.removeTrackedArtist,
    listSavedArtistsForUser: trackedArtists.listSavedArtistsForUser,
    syncArtistsFromTrackerPlaylist:
      trackedArtists.syncArtistsFromTrackerPlaylist,
    syncTrackerPlaylistsForAllUsers:
      trackedArtists.syncTrackerPlaylistsForAllUsers,

    getSeenArtists: seenArtists.getSeenArtists,
    addSeenArtist: seenArtists.addSeenArtist,
    updateSeenArtist: seenArtists.updateSeenArtist,
    deleteSeenArtist: seenArtists.deleteSeenArtist,

    collectNewReleasesForUser: releasesPlaylist.collectNewReleasesForUser,
    appendNewReleasesToPlaylist: releasesPlaylist.appendNewReleasesToPlaylist,
    syncNewReleasesToUserPlaylist:
      releasesPlaylist.syncNewReleasesToUserPlaylist,
    syncNewReleasesForAllUsers: releasesPlaylist.syncNewReleasesForAllUsers,
    getUserReleasesPlaylistWithTracks:
      releasesPlaylist.getUserReleasesPlaylistWithTracks,

    requireUser: accounts.requireUser,
    requireAdmin: accounts.requireAdmin,
    getSession: accounts.getSession,

    getPlaylistSettings: playlistSettings.getPlaylistSettings,
    listOwnedPlaylists: playlistSettings.listOwnedPlaylists,
    selectPlaylist: playlistSettings.selectPlaylist,
    renamePlaylist: playlistSettings.renamePlaylist,
  };
}
