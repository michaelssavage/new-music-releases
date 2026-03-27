import type { SavedArtistI } from "@model/spotify";
import type { Artist } from "@model/spotify/liked-tracks";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import { logger } from "@server/utils/logger";

type Repository = ReturnType<typeof SpotifyRepository>;

export function createTrackedArtistsService(deps: {
  repository: Repository;
  api: SpotifyWebApi;
}) {
  const { repository, api } = deps;

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

  return {
    listUniqueArtistsFromLikedTracks,
    persistTrackedArtists,
    removeTrackedArtist,
    listSavedArtistsForUser,
  };
}
