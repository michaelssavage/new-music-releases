import type { SeenArtistI, SightingI } from "@model/seen-artists";
import { SpotifyRepository } from "@server/repository/spotify.repository";
import { createLastFmApi } from "@server/service/lastfm-api";
import {
  GENRES,
  OTHER_GENRE,
  countByGenre,
  withPrimaryGenre,
} from "@server/service/spotify-domain/genre-buckets";
import { logger } from "@server/utils/logger";
import { validateEnv } from "@server/utils/validateEnv";
import dotenv from "dotenv";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pLimit from "p-limit";

const LASTFM_CONCURRENCY = 3;
const isDryRun = process.argv.includes("--dry-run");

// `lastfmName` overrides the Last.fm lookup when `name` doesn't match it
// (e.g. a b2b set). `genre` overrides the tag-derived genre for artists
// Last.fm has no usable tags for.
interface SightingsFileEntry {
  name: string;
  lastfmName?: string;
  genre?: string;
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
      assert(
        genre === undefined || GENRES.includes(genre),
        `${name}: unknown genre "${genre}". Use one of: ${GENRES.join(", ")}`,
      );
      return limit(
        async (): Promise<SeenArtistI> => ({
          name,
          sightings: sightings.map(({ event, year }) => ({ event, year })),
          tags: await lastFm.fetchTopTags(lastfmName ?? name),
          ...(genre && { genre }),
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
      await repository.upsertSeenArtists(artists);
    } finally {
      await repository.disconnect();
    }
    logger.info(`Imported ${artists.length} seen artists.`);
  }

  const withGenre = withPrimaryGenre(artists);
  logger.info(
    countByGenre(withGenre)
      .map(({ genre, artists }) => `${genre}: ${artists}`)
      .join(", "),
  );

  for (const { name, genre } of withGenre) {
    if (genre !== OTHER_GENRE) continue;
    const tags = artists.find((artist) => artist.name === name)?.tags ?? [];
    logger.warn(
      `No genre for ${name}. Tags: ${tags.map((tag) => tag.name).join(", ") || "none"}`,
    );
  }
}

main().catch((error) => {
  logger.error("import-seen-artists failed:", error);
  process.exit(1);
});
