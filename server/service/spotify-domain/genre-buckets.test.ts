import { type Genre, OTHER_GENRE } from "@model/seen-artists";
import assert from "node:assert/strict";
import test from "node:test";
import { countByGenre, genresOf, primaryGenre } from "./genre-buckets";

test("an artist's genre is the bucket with the highest tag weight", () => {
  const cases: Array<[tags: Array<[string, number]>, genre: string]> = [
    [
      [
        ["techno", 100],
        ["dubstep", 50],
        ["electronic", 27],
      ],
      "Electronic",
    ],
    [
      [
        ["irish", 100],
        ["folk", 100],
        ["celtic", 17],
      ],
      "Folk / Trad",
    ],
    [
      [
        ["Hip-Hop", 92],
        ["rap", 55],
        ["irish", 100],
      ],
      "Hip-hop",
    ],
    [
      [
        ["Garage Rock", 3],
        ["post-punk", 64],
      ],
      "Rock / Punk",
    ],
    [
      [
        ["indie rock", 100],
        ["post-punk", 85],
        ["indie pop", 45],
      ],
      "Indie / Alternative",
    ],
  ];

  for (const [tags, genre] of cases) {
    const artistTags = tags.map(([name, count]) => ({ name, count }));
    assert.equal(primaryGenre(artistTags), genre);
  }
});

test("an artist with no recognised tags is Other", () => {
  assert.equal(primaryGenre([]), OTHER_GENRE);
  assert.equal(
    primaryGenre([
      { name: "irish", count: 100 },
      { name: "seen live", count: 40 },
    ]),
    OTHER_GENRE,
  );
});

test("an artist with several genres counts toward each; counts sort by size, then name", () => {
  const genres: Array<Array<Genre>> = [
    ["Rock / Punk"],
    ["Electronic", "Pop"],
    ["Electronic"],
    ["Pop"],
    ["Electronic"],
  ];
  const artists = genres.map((artistGenres, index) => ({
    id: `${index}`,
    name: `artist ${index}`,
    sightings: [],
    genres: artistGenres,
  }));

  assert.deepEqual(countByGenre(artists), [
    { genre: "Electronic", artists: 3 },
    { genre: "Pop", artists: 2 },
    { genre: "Rock / Punk", artists: 1 },
  ]);
});

test("chosen genres replace the automatic one", () => {
  const tags = [{ name: "techno", count: 100 }];

  assert.deepEqual(genresOf({ tags }), ["Electronic"]);
  assert.deepEqual(genresOf({ tags, genreOverrides: [] }), ["Electronic"]);
  assert.deepEqual(
    genresOf({ tags, genreOverrides: ["Alternative Folk", "Electronic"] }),
    ["Alternative Folk", "Electronic"],
  );
});
