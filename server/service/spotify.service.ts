import type { SpotifyServiceI } from "@server/container/types";
import { logger } from "@server/utils/logger";
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

  async function syncArtistsFromPlaylistForAllUsers(playlistId: string) {
    const users = await repository.getAllUsers();

    if (!users || users.length === 0) {
      logger.warn("syncArtistsFromPlaylistForAllUsers:No users found.");
      return;
    }

    logger.info(
      `syncArtistsFromPlaylistForAllUsers:Syncing playlist ${playlistId} for ${users.length} users.`,
    );

    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          const token = await userSession.ensureValidAccessToken(user);
          return await trackedArtists.syncArtistsFromPlaylist(
            user.userId,
            token,
            playlistId,
          );
        } catch (error) {
          logger.error(
            `syncArtistsFromPlaylistForAllUsers:Failed for user ${user.userId}:`,
            error,
          );
          return null;
        }
      }),
    );

    const saved = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .reduce(
        (sum, r) =>
          sum +
          ((r as PromiseFulfilledResult<{ saved: number } | null>).value
            ?.saved ?? 0),
        0,
      );

    logger.info(
      `syncArtistsFromPlaylistForAllUsers:Done. ${saved} new artists saved across all users.`,
    );

    return results;
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
    syncArtistsFromPlaylist: trackedArtists.syncArtistsFromPlaylist,
    syncArtistsFromPlaylistForAllUsers,

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
