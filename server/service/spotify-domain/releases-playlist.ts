import type { PlaylistRole } from "@model/playlist-settings";
import type { NewReleasesI, SpotifyDataProps } from "@model/spotify";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import type { User } from "@model/spotify/user";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import type { PlaylistPageParams } from "@server/service/spotify-api/playlists";
import type { UpdateUserPlaylistI } from "@server/service/types";
import { logger } from "@server/utils/logger";
import axios from "axios";
import pLimit from "p-limit";

type Repository = ReturnType<typeof SpotifyRepository>;

const RELEASE_FETCH_CONCURRENCY = 3;

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
  ensurePlaylistId: (
    user: User,
    token: string,
    role: PlaylistRole,
  ) => Promise<string>;
}) {
  const { repository, api, ensureValidAccessToken, ensurePlaylistId } = deps;

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
      return { releases: [], failedArtistIds: [] };
    }

    logger.info(
      `collectNewReleasesForUser:${artists.length} Artists retrieved from MongoDB.`,
    );

    const limit = pLimit(RELEASE_FETCH_CONCURRENCY);

    const results = await Promise.all(
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

            return { release };
          } catch (error) {
            logger.error(
              `collectNewReleasesForUser:Failed to fetch albums for artist ${artist.id}:`,
              error instanceof Error ? error.message : error,
            );
            return { failedArtistId: artist.id };
          }
        }),
      ),
    );

    return {
      releases: results.flatMap((result) => result.release ?? []),
      failedArtistIds: results.flatMap((result) => result.failedArtistId ?? []),
    };
  }

  async function addReleasesToPlaylist({
    token,
    playlistId,
    existingTrackUris,
    releases,
    userId,
  }: {
    token: string;
    playlistId: string;
    existingTrackUris: Set<string>;
    releases: Array<NewReleasesI>;
    userId: string;
  }) {
    if (releases.length === 0) {
      logger.warn(`addReleasesToPlaylist:No new releases found for ${userId}`);
      return [];
    }

    const limit = pLimit(5);
    const uniqueReleases = [
      ...new Map(releases.map((release) => [release.uri, release])).values(),
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
    const newTrackUris = [
      ...new Set(trackUris.filter((uri) => !existingTrackUris.has(uri))),
    ];

    logger.info("addReleasesToPlaylist:Flattened track Uris", {
      discovered: trackUris.length,
      new: newTrackUris.length,
      userId,
    });

    if (newTrackUris.length === 0) {
      logger.info(
        `addReleasesToPlaylist:All releases already exist in playlist for ${userId}`,
      );
      return [];
    }

    return api.appendTracksToPlaylist(token, playlistId, newTrackUris);
  }

  async function appendNewReleasesToPlaylist({
    userId,
    token,
    playlistId,
    fromDate,
  }: UpdateUserPlaylistI) {
    const playlistItems = await api.fetchPlaylistTracksAddedSince(
      token,
      playlistId,
      fromDate,
    );
    const playlistFromDate = getLatestPlaylistAdditionDate(playlistItems.items);
    const effectiveFromDate =
      fromDate ?? playlistFromDate ?? new Date().toISOString().split("T")[0];

    const { releases, failedArtistIds } = await collectNewReleasesForUser(
      userId,
      token,
      effectiveFromDate,
    );

    logger.info(
      "appendNewReleasesToPlaylist:All new releases collected from Spotify.",
      {
        newReleases: releases.length,
        failedArtists: failedArtistIds.length,
        fromDate: effectiveFromDate,
        userId,
      },
    );

    const addedTracks = await addReleasesToPlaylist({
      token,
      playlistId,
      existingTrackUris: new Set(
        playlistItems.items.map(({ track }) => track.uri),
      ),
      releases,
      userId,
    });

    return { addedTracks, failedArtistIds };
  }

  async function syncNewReleasesToUserPlaylist(
    user: User,
    token: string,
    fromDate?: string,
  ) {
    const playlistId = await ensurePlaylistId(user, token, "releases");

    const checkpointDate = user.lastReleaseSyncAt?.toISOString().split("T")[0];
    const { addedTracks, failedArtistIds } = await appendNewReleasesToPlaylist({
      userId: user.userId,
      token,
      playlistId,
      fromDate: fromDate ?? checkpointDate,
    });

    // Keep the checkpoint where it was so the next run retries the failed artists.
    if (failedArtistIds.length > 0) {
      throw new Error(
        `syncNewReleasesToUserPlaylist:Releases for ${failedArtistIds.length} artists could not be fetched for user ${user.userId}; checkpoint not advanced`,
      );
    }

    await repository.setLastReleaseSyncAt(user.userId, new Date());
    return addedTracks;
  }

  async function syncNewReleasesForAllUsers(fromDate?: string) {
    try {
      const users = await repository.getAllUsers();

      if (users.length === 0) {
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

            return await syncNewReleasesToUserPlaylist(user, token, fromDate);
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
    user: User,
    token: string,
    page: PlaylistPageParams,
  ): Promise<SpotifyDataProps> {
    const playlistId = await ensurePlaylistId(user, token, "releases");

    const [playlist, playlistItems] = await Promise.all([
      api.fetchPlaylist(token, playlistId),
      api.fetchPlaylistTracksNewestFirst(token, playlistId, page),
    ]);

    return { playlist, playlistItems };
  }

  return {
    collectNewReleasesForUser,
    appendNewReleasesToPlaylist,
    syncNewReleasesToUserPlaylist,
    syncNewReleasesForAllUsers,
    getUserReleasesPlaylistWithTracks,
  };
}
