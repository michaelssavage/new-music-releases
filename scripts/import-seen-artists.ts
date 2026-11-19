import {
  type Genre,
  OTHER_GENRE,
  type SeenArtistI,
  type SightingI,
} from "@model/seen-artists";
import { SpotifyRepository } from "@server/repository/spotify.repository";
import { createLastFmApi } from "@server/service/lastfm-api";
import {
  countByGenre,
  genresOf,
} from "@server/service/spotify-domain/genre-buckets";
import { logger } from "@server/utils/logger";
import { validateEnv } from "@server/utils/validateEnv";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pLimit from "p-limit";

const LASTFM_CONCURRENCY = 3;
const isDryRun = process.argv.includes("--dry-run");

// Only artists missing from MongoDB are inserted, so edits made in the app
// survive a re-run. `lastfmName` overrides the Last.fm lookup when `name`
// doesn't match it (e.g. a b2b set); `genre` overrides the tag-derived genre.
interface SightingsFileEntry {
  name: string;
  lastfmName?: string;
  genre?: Genre;
  sightings: Array<SightingI>;
}

async function main() {
  const rootDir = path.resolve(fileURLToPath(import.meta.url), "../..");
  dotenv.config({ path: path.join(rootDir, ".env") });
  const env = validateEnv();

  const entries: Array<SightingsFileEntry> = JSON.parse(
    await readFile(path.join(rootDir, "concert_sightings.json"), "utf-8"),
  );

  const lastFm = createLastFmApi({ apiKey: env.LASTFM_API_KEY });
  const limit = pLimit(LASTFM_CONCURRENCY);

  const artists = await Promise.all(
    entries.map(({ name, lastfmName, genre, sightings }) => {
      return limit(
        async (): Promise<SeenArtistI> => ({
          name,
          sightings: sightings.map(({ event, year }) => ({ event, year })),
          tags: await lastFm.fetchTopTags(lastfmName ?? name),
          ...(genre && { genreOverrides: [genre] }),
        }),
      );
    }),
  );

  if (isDryRun) {
    logger.info("Dry run: nothing written to MongoDB.");
  } else {
    const repository = SpotifyRepository({ mongoUri: env.MONGO_URI });
    await repository.connect();
    try {
      await repository.insertMissingSeenArtists(artists);
    } finally {
      await repository.disconnect();
    }
    logger.info(`Imported ${artists.length} seen artists.`);
  }

  const withGenre = artists.map((artist) => ({
    ...artist,
    genres: genresOf(artist),
  }));
  logger.info(
    countByGenre(withGenre)
      .map(({ genre, artists }) => `${genre}: ${artists}`)
      .join(", "),
  );

  for (const { name, genres, tags } of withGenre) {
    if (!genres.includes(OTHER_GENRE)) continue;
    logger.warn(
      `No genre for ${name}. Tags: ${tags.map((tag) => tag.name).join(", ") || "none"}`,
    );
  }
}

main().catch((error) => {
  logger.error("import-seen-artists failed:", error);
  process.exit(1);
});
