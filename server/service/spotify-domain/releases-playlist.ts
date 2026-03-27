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
            return [];
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
    const newReleases: Array<NewReleasesI> = await collectNewReleasesForUser(
      userId,
      token,
      fromDate,
    );

    logger.info(
      "appendNewReleasesToPlaylist:All new releases collected from Spotify.",
      {
        newReleases: newReleases.length,
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

    const trackUris = (
      await Promise.all(
        newReleases.map(({ uri, id }) =>
          limit(async () => {
            if (uri.includes("album")) {
              return await api.fetchAlbumTrackUris(token, id);
            }
            return uri;
          }),
        ),
      )
    ).flat();

    logger.info("appendNewReleasesToPlaylist:Flattened track Uris", {
      trackUris,
      userId,
    });

    return api.appendTracksToPlaylist(token, playlist.id, trackUris);
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
      logger.warn(
        "syncNewReleasesToUserPlaylist:No playlist found for user:",
        userId,
      );
      return;
    }

    return appendNewReleasesToPlaylist({
      userId,
      token,
      playlist,
      fromDate,
    });
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
            return null;
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
      }

      return results;
    } catch (error) {
      logger.error(
        "syncNewReleasesForAllUsers:Error in updating playlists:",
        error,
      );
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
    return { playlist, playlistItems };
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
