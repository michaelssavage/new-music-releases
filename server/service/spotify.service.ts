import type { SpotifyServiceI } from "@server/container/types";
import { createSpotifyOAuth } from "./spotify-domain/oauth";
import { createReleasesPlaylistService } from "./spotify-domain/releases-playlist";
import { createTrackedArtistsService } from "./spotify-domain/tracked-artists";
import { createUserSession } from "./spotify-domain/user-session";

export function SpotifyService({ repository, env, api }: SpotifyServiceI) {
  const oauth = createSpotifyOAuth(env);
  const userSession = createUserSession({ repository, api, oauth });
  const trackedArtists = createTrackedArtistsService({ repository, api });
  const releasesPlaylist = createReleasesPlaylistService({
    repository,
    api,
    ensureValidAccessToken: userSession.ensureValidAccessToken,
  });

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

    completeOAuthLogin: userSession.completeOAuthLogin,
    getUser: userSession.getUser,
    saveUser: userSession.saveUser,
    ensureValidAccessToken: userSession.ensureValidAccessToken,

    listUniqueArtistsFromLikedTracks:
      trackedArtists.listUniqueArtistsFromLikedTracks,
    persistTrackedArtists: trackedArtists.persistTrackedArtists,
    removeTrackedArtist: trackedArtists.removeTrackedArtist,
    listSavedArtistsForUser: trackedArtists.listSavedArtistsForUser,

    collectNewReleasesForUser: releasesPlaylist.collectNewReleasesForUser,
    appendNewReleasesToPlaylist: releasesPlaylist.appendNewReleasesToPlaylist,
    ensureReleasesPlaylistForUser:
      releasesPlaylist.ensureReleasesPlaylistForUser,
    syncNewReleasesToUserPlaylist:
      releasesPlaylist.syncNewReleasesToUserPlaylist,
    syncNewReleasesForAllUsers: releasesPlaylist.syncNewReleasesForAllUsers,
    getUserReleasesPlaylistWithTracks:
      releasesPlaylist.getUserReleasesPlaylistWithTracks,
  };
}
