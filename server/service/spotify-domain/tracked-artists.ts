import type { SavedArtistI } from "@model/spotify";
import type { Artist } from "@model/spotify/liked-tracks";
import type { User } from "@model/spotify/user";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import { HttpException } from "@server/utils/exceptions";
import { logger } from "@server/utils/logger";

type Repository = ReturnType<typeof SpotifyRepository>;

export function createTrackedArtistsService(deps: {
  repository: Repository;
  api: SpotifyWebApi;
  ensureValidAccessToken: (user: User) => Promise<string>;
}) {
  const { repository, api, ensureValidAccessToken } = deps;

  async function listUniqueArtistsFromLikedTracks(token: string) {
    const tracks = await api.fetchLikedTracks(token);

    const artistMap = new Map<string, Artist>();

    for (const item of tracks.items) {
      for (const artist of item.track.artists) {
        if (!artistMap.has(artist.id)) {
          artistMap.set(artist.id, artist);
        }
      }
    }

    logger.info(
      "listUniqueArtistsFromLikedTracks:Artists fetched from saved tracks.",
      artistMap.size,
    );
    return Array.from(artistMap.values());
  }

  async function persistTrackedArtists(userId: string, artists: Array<Artist>) {
    if (artists.length === 0) {
      logger.warn("persistTrackedArtists:No artists to save.");
      return null;
    }

    const artistsToSave: Array<SavedArtistI> = artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      uri: artist.uri,
      image: artist?.images?.[0]?.url || "",
      createdDate: new Date(),
    }));

    const result = await repository.saveArtists(userId, artistsToSave);

    logger.info(
      `persistTrackedArtists:${artists.length} artists added/updated in the database.`,
    );
    return result;
  }

  async function removeTrackedArtist(userId: string, id: string) {
    const result = await repository.removeSavedArtist(userId, id);

    logger.info(
      `removeTrackedArtist:Removed artist with id: ${id} from the database.`,
    );
    return result;
  }

  async function listSavedArtistsForUser(
    userId: string,
  ): Promise<Array<SavedArtistI>> {
    const savedArtists = await repository.getAllArtists(userId);
    logger.info(
      `listSavedArtistsForUser:Fetched ${savedArtists.length} saved artists for user ${userId}.`,
    );

    return savedArtists ?? [];
  }

  async function syncArtistsFromPlaylist(
    userId: string,
    token: string,
    playlistId: string,
  ) {
    const { items } = await api.fetchPlaylistTracks(token, playlistId);

    const artistMap = new Map<string, Artist>();
    for (const item of items) {
      for (const artist of item.track.artists) {
        if (!artistMap.has(artist.id)) {
          artistMap.set(artist.id, artist);
        }
      }
    }

    logger.info(
      `syncArtistsFromPlaylist:Found ${artistMap.size} unique artists in playlist ${playlistId}.`,
    );

    const savedArtists = await repository.getAllArtists(userId);
    const savedIds = new Set(savedArtists.map((a) => a.id));
    const newArtists = Array.from(artistMap.values()).filter(
      (a) => !savedIds.has(a.id),
    );

    logger.info(
      `syncArtistsFromPlaylist:${newArtists.length} new artists to save (${savedIds.size} already saved).`,
    );

    if (newArtists.length === 0) return { saved: 0 };

    await persistTrackedArtists(userId, newArtists);
    return { saved: newArtists.length };
  }

  async function syncArtistsFromTrackerPlaylist(user: User, token: string) {
    if (!user.trackerPlaylistId) {
      throw new HttpException(409, "No tracker playlist selected yet");
    }
    return syncArtistsFromPlaylist(user.userId, token, user.trackerPlaylistId);
  }

  async function syncTrackerPlaylistsForAllUsers() {
    const users = (await repository.getAllUsers()).filter(
      ({ trackerPlaylistId }) => trackerPlaylistId,
    );

    if (users.length === 0) {
      logger.warn(
        "syncTrackerPlaylistsForAllUsers:No users with a tracker playlist.",
      );
      return;
    }

    logger.info(
      `syncTrackerPlaylistsForAllUsers:Syncing tracker playlists for ${users.length} users.`,
    );

    const results = await Promise.all(
      users.map(async (user) => {
        try {
          const token = await ensureValidAccessToken(user);
          return await syncArtistsFromTrackerPlaylist(user, token);
        } catch (error) {
          logger.error(
            `syncTrackerPlaylistsForAllUsers:Failed for user ${user.userId}:`,
            error,
          );
          return { saved: 0 };
        }
      }),
    );

    const saved = results.reduce((sum, result) => sum + result.saved, 0);
    logger.info(
      `syncTrackerPlaylistsForAllUsers:Done. ${saved} new artists saved across all users.`,
    );
  }

  return {
    listUniqueArtistsFromLikedTracks,
    persistTrackedArtists,
    removeTrackedArtist,
    listSavedArtistsForUser,
    syncArtistsFromTrackerPlaylist,
    syncTrackerPlaylistsForAllUsers,
  };
}
