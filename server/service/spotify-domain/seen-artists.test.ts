import type { SeenArtistI, StoredSeenArtistI } from "@model/seen-artists";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { LastFmApi } from "@server/service/lastfm-api";
import assert from "node:assert/strict";
import test from "node:test";
import { createSeenArtistsService } from "./seen-artists";

const TECHNO_TAGS = [{ name: "techno", count: 100 }];

function setup(stored: Array<StoredSeenArtistI>) {
  const replaced: Array<{ id: string; artist: SeenArtistI }> = [];
  const inserted: Array<SeenArtistI> = [];
  const lastFmLookups: Array<string> = [];

  const byName = (name: string) =>
    stored.find((artist) => artist.name.toLowerCase() === name.toLowerCase()) ??
    null;

  const repository = {
    findSeenArtistByName: async (name: string) => byName(name),
    findSeenArtistById: async (id: string) =>
      stored.find((artist) => artist.id === id) ?? null,
    replaceSeenArtist: async (id: string, artist: SeenArtistI) => {
      replaced.push({ id, artist });
    },
    insertSeenArtist: async (artist: SeenArtistI) => {
      inserted.push(artist);
    },
  } as unknown as ReturnType<typeof SpotifyRepository>;

  const lastFm: LastFmApi = {
    fetchTopTags: async (name) => {
      lastFmLookups.push(name);
      return TECHNO_TAGS;
    },
  };

  return {
    service: createSeenArtistsService({ repository, lastFm }),
    replaced,
    inserted,
    lastFmLookups,
  };
}

const blawan: StoredSeenArtistI = {
  id: "1",
  name: "Blawan",
  sightings: [{ event: "SOUNDIT", year: 2026 }],
  tags: TECHNO_TAGS,
};

test("adding an artist seen again appends only new sightings", async () => {
  const { service, replaced, inserted, lastFmLookups } = setup([blawan]);

  await service.addSeenArtist({
    name: "blawan",
    sightings: [
      { event: "SOUNDIT", year: 2026 },
      { event: "Mira", year: 2025 },
    ],
  });

  assert.deepEqual(replaced, [
    {
      id: "1",
      artist: {
        name: "Blawan",
        sightings: [
          { event: "SOUNDIT", year: 2026 },
          { event: "Mira", year: 2025 },
        ],
        tags: TECHNO_TAGS,
      },
    },
  ]);
  assert.deepEqual(inserted, []);
  assert.deepEqual(lastFmLookups, []);
});

test("a new artist is stored with its Last.fm tags", async () => {
  const { service, inserted } = setup([]);

  await service.addSeenArtist({
    name: "Kettama",
    sightings: [{ event: "Boxed Off", year: 2018 }],
  });

  assert.deepEqual(inserted, [
    {
      name: "Kettama",
      sightings: [{ event: "Boxed Off", year: 2018 }],
      tags: TECHNO_TAGS,
    },
  ]);
});

test("tags are re-fetched only when an artist is renamed", async () => {
  const { service, lastFmLookups } = setup([blawan]);
  const sightings = blawan.sightings;

  await service.updateSeenArtist("1", { name: "BLAWAN", sightings });
  assert.deepEqual(lastFmLookups, []);

  await service.updateSeenArtist("1", { name: "Blawan (live)", sightings });
  assert.deepEqual(lastFmLookups, ["Blawan (live)"]);
});

test("renaming onto another artist's name is rejected", async () => {
  const kettama: StoredSeenArtistI = { ...blawan, id: "2", name: "Kettama" };
  const { service, replaced } = setup([blawan, kettama]);

  await assert.rejects(
    service.updateSeenArtist("2", {
      name: "Blawan",
      sightings: kettama.sightings,
    }),
    { status: 409 },
  );
  assert.deepEqual(replaced, []);
});
