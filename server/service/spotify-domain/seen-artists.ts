import type {
  SeenArtistInputI,
  SeenArtistsResponse,
  SightingI,
} from "@model/seen-artists";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { LastFmApi } from "@server/service/lastfm-api";
import { HttpException } from "@server/utils/exceptions";
import { logger } from "@server/utils/logger";
import { countByGenre, withGenres } from "./genre-buckets";

type Repository = ReturnType<typeof SpotifyRepository>;

function sameName(a: string, b: string) {
  return a.localeCompare(b, "en", { sensitivity: "accent" }) === 0;
}

function mergeSightings(
  existing: Array<SightingI>,
  added: Array<SightingI>,
): Array<SightingI> {
  const isNew = ({ event, year }: SightingI) =>
    !existing.some(
      (sighting) => sighting.event === event && sighting.year === year,
    );
  return [...existing, ...added.filter(isNew)];
}

export function createSeenArtistsService(deps: {
  repository: Repository;
  lastFm: LastFmApi;
}) {
  const { repository, lastFm } = deps;

  async function getSeenArtists(userId: string): Promise<SeenArtistsResponse> {
    const seenArtists = await repository.getSeenArtists(userId);
    const artists = withGenres(seenArtists);

    return { artists, genres: countByGenre(artists) };
  }

  // An artist seen again gains sightings instead of a duplicate entry.
  async function addSeenArtist(userId: string, input: SeenArtistInputI) {
    const existing = await repository.findSeenArtistByName(userId, input.name);

    if (existing) {
      const { id, ...stored } = existing;
      const genreOverrides = input.genreOverrides ?? stored.genreOverrides;
      await repository.replaceSeenArtist(userId, id, {
        ...stored,
        sightings: mergeSightings(stored.sightings, input.sightings),
        ...(genreOverrides && { genreOverrides }),
      });
      logger.info(`addSeenArtist:Added sightings to ${stored.name}.`);
      return;
    }

    await repository.insertSeenArtist(userId, {
      ...input,
      tags: await lastFm.fetchTopTags(input.name),
    });
    logger.info(`addSeenArtist:Added ${input.name}.`);
  }

  async function updateSeenArtist(
    userId: string,
    id: string,
    input: SeenArtistInputI,
  ) {
    const existing = await repository.findSeenArtistById(userId, id);
    if (!existing) throw new HttpException(404, "Seen artist not found.");

    const renamed = !sameName(existing.name, input.name);
    if (renamed) {
      const nameTaken = await repository.findSeenArtistByName(
        userId,
        input.name,
      );
      if (nameTaken) {
        throw new HttpException(409, `${input.name} is already in the list.`);
      }
    }

    await repository.replaceSeenArtist(userId, id, {
      ...input,
      tags: renamed ? await lastFm.fetchTopTags(input.name) : existing.tags,
    });
    logger.info(`updateSeenArtist:Updated ${input.name}.`);
  }

  async function deleteSeenArtist(userId: string, id: string) {
    await repository.deleteSeenArtist(userId, id);
    logger.info(`deleteSeenArtist:Deleted seen artist ${id}.`);
  }

  return { getSeenArtists, addSeenArtist, updateSeenArtist, deleteSeenArtist };
}
