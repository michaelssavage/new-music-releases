import type { NewReleasesI } from "@model/spotify";
import type { SpotifyPlaylistI } from "@model/spotify/playlist";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import type { User } from "@model/spotify/user";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import type { UpdateUserPlaylistI } from "@server/service/types";
import { logger } from "@server/utils/logger";
import axios from "axios";
import pLimit from "p-limit";

type Repository = ReturnType<typeof SpotifyRepository>;

export function getLatestPlaylistAdditionDate(
  items: PlaylistTracksI["items"],
): string | undefined {
  const latestTimestamp = items.reduce((latest, item) => {
    const timestamp = new Date(item.added_at).getTime();
    return Number.isNaN(timestamp) ? latest : Math.max(latest, timestamp);
  }, Number.NEGATIVE_INFINITY);

  if (!Number.isFinite(latestTimestamp)) return undefined;
  return new Date(latestTimestamp).toISOString().split("T")[0];
}

export function createReleasesPlaylistService(deps: {
  repository: Repository;
  api: SpotifyWebApi;
  ensureValidAccessToken: (user: User) => Promise<string>;
}) {
  const { repository, api, ensureValidAccessToken } = deps;

  async function collectNewReleasesForUser(
    userId: string,
    token: string,
    fromDate?: string,
  ) {
    const artists = await repository.getAllArtists(userId);
    if (!artists || artists.length === 0) {
      logger.warn(
        "collectNewReleasesForUser:No artists found for user:",
        userId,
      );
      return [];
    }

    logger.info(
      `collectNewReleasesForUser:${artists.length} Artists retrieved from MongoDB.`,
    );

    const limit = pLimit(5);

    const releasesArray = await Promise.all(
      artists.map((artist) =>
        limit(async () => {
          try {
            const release = await api.fetchArtistAlbums(
              token,
              artist.id,
              fromDate,
            );

            if (release.length > 0) {
              logger.info(
                `collectNewReleasesForUser:Release returned for ${artist.id}:`,
                {
                  release: release.map(({ name }) => name),
                },
              );
            }

            return release;
          } catch (error) {
            logger.error(
              `collectNewReleasesForUser:Failed to fetch albums for artist ${artist.id}:`,
              error,
            );
            throw error;
          }
        }),
      ),
    );

    return releasesArray.flat();
  }

  async function appendNewReleasesToPlaylist({
    userId,
    token,
    playlist,
    fromDate,
  }: UpdateUserPlaylistI) {
    const playlistItems = await api.fetchPlaylistTracks(token, playlist.id);
    const playlistFromDate = getLatestPlaylistAdditionDate(playlistItems.items);
    const effectiveFromDate =
      fromDate ?? playlistFromDate ?? new Date().toISOString().split("T")[0];

    const newReleases: Array<NewReleasesI> = await collectNewReleasesForUser(
      userId,
      token,
      effectiveFromDate,
    );

    logger.info(
      "appendNewReleasesToPlaylist:All new releases collected from Spotify.",
      {
        newReleases: newReleases.length,
        fromDate: effectiveFromDate,
        userId,
      },
    );

    if (newReleases.length === 0) {
      logger.warn(
        `appendNewReleasesToPlaylist:No new releases found for ${userId}`,
      );
      return [];
    }

    const limit = pLimit(5);
    const uniqueReleases = [
      ...new Map(newReleases.map((release) => [release.uri, release])).values(),
    ];

    const trackUris = (
      await Promise.all(
        uniqueReleases.map(({ uri, id }) =>
          limit(async () => {
            if (uri.includes("album")) {
              return await api.fetchAlbumTrackUris(token, id);
            }
            return uri;
          }),
        ),
      )
    ).flat();
    const existingTrackUris = new Set(
      playlistItems.items.map(({ track }) => track.uri),
    );
    const newTrackUris = [
      ...new Set(trackUris.filter((uri) => !existingTrackUris.has(uri))),
    ];

    logger.info("appendNewReleasesToPlaylist:Flattened track Uris", {
      discovered: trackUris.length,
      new: newTrackUris.length,
      userId,
    });

    if (newTrackUris.length === 0) {
      logger.info(
        `appendNewReleasesToPlaylist:All releases already exist in playlist for ${userId}`,
      );
      return [];
    }

    return api.appendTracksToPlaylist(token, playlist.id, newTrackUris);
  }

  async function ensureReleasesPlaylistForUser(userId: string, token: string) {
    const existingPlaylist = await repository.getPlaylist(userId);
    if (existingPlaylist) {
      logger.info(
        "ensureReleasesPlaylistForUser:Playlist found in MongoDB:",
        existingPlaylist.name,
      );
      return existingPlaylist;
    }

    logger.warn(
      `ensureReleasesPlaylistForUser:No playlist found in MongoDB for ${userId}`,
    );
    const newPlaylist = await api.createReleasesPlaylist(token);

    if (newPlaylist) {
      const res = await repository.createPlaylist(userId, newPlaylist);
      if (res.acknowledged) {
        logger.info(
          "ensureReleasesPlaylistForUser:Playlist created in MongoDB:",
          newPlaylist.name,
        );
        return newPlaylist;
      }
    }
    return null;
  }

  async function syncNewReleasesToUserPlaylist(
    userId: string,
    token: string,
    fromDate?: string,
  ) {
    const playlist = await ensureReleasesPlaylistForUser(userId, token);

    if (!playlist) {
      throw new Error(
        `syncNewReleasesToUserPlaylist:Unable to find or create playlist for user ${userId}`,
      );
    }

    const user = fromDate ? undefined : await repository.getUser(userId);
    const checkpointDate = user?.lastReleaseSyncAt?.toISOString().split("T")[0];
    const result = await appendNewReleasesToPlaylist({
      userId,
      token,
      playlist,
      fromDate: fromDate ?? checkpointDate,
    });
    await repository.setLastReleaseSyncAt(userId, new Date());
    return result;
  }

  async function syncNewReleasesForAllUsers(fromDate?: string) {
    try {
      const users = await repository.getAllUsers();

      if (!users || users.length === 0) {
        logger.warn(
          "syncNewReleasesForAllUsers:No users found for updating playlists.",
        );
        return;
      }

      logger.info(
        `syncNewReleasesForAllUsers:Updating playlists for ${users.length} users.`,
      );

      const results = await Promise.allSettled(
        users.map(async (user) => {
          try {
            const token = await ensureValidAccessToken(user);
            logger.debug(
              `syncNewReleasesForAllUsers:token received for user ${user.userId}`,
            );

            return await syncNewReleasesToUserPlaylist(
              user.userId,
              token,
              fromDate,
            );
          } catch (error) {
            if (axios.isAxiosError(error)) {
              logger.error(
                `syncNewReleasesForAllUsers:Error updating playlist for user ${user.userId}:`,
                {
                  status: error.response?.status,
                  message: error.response?.data || error.message,
                },
              );
            } else {
              logger.error(
                "syncNewReleasesForAllUsers:An unexpected error occurred while updating user playlist:",
                error,
              );
            }
            throw error;
          }
        }),
      );

      const successfulUpdates = results.filter(
        (result) => result?.status === "fulfilled",
      );
      const errors = results.filter((result) => result?.status === "rejected");

      logger.info(
        `syncNewReleasesForAllUsers:Successful updates: ${successfulUpdates.length}`,
      );

      if (errors.length > 0) {
        logger.error(
          `syncNewReleasesForAllUsers:Failed updates: ${errors.length}`,
        );
        throw new AggregateError(
          errors.map((result) => result.reason),
          `Failed to update playlists for ${errors.length} user${errors.length === 1 ? "" : "s"}`,
        );
      }

      return results;
    } catch (error) {
      logger.error(
        "syncNewReleasesForAllUsers:Error in updating playlists:",
        error,
      );
      throw error;
    }
  }

  async function getUserReleasesPlaylistWithTracks(
    userId: string,
    token: string,
  ): Promise<{
    playlist: SpotifyPlaylistI;
    playlistItems: { items: PlaylistTracksI["items"] };
  } | null> {
    const playlist = await ensureReleasesPlaylistForUser(userId, token);
    if (!playlist) {
      return null;
    }

    const playlistItems = await api.fetchPlaylistTracks(token, playlist.id);

    const sortedItems = [...playlistItems.items].sort(
      (a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime(),
    );

    return { playlist, playlistItems: { items: sortedItems } };
  }

  return {
    collectNewReleasesForUser,
    appendNewReleasesToPlaylist,
    ensureReleasesPlaylistForUser,
    syncNewReleasesToUserPlaylist,
    syncNewReleasesForAllUsers,
    getUserReleasesPlaylistWithTracks,
  };
}
