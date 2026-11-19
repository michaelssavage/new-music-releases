import assert from "node:assert/strict";
import test from "node:test";
import { OTHER_GENRE, countByGenre, primaryGenre } from "./genre-buckets";

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

test("genre counts are sorted by size, then name", () => {
  const artists = [
    "Rock / Punk",
    "Electronic",
    "Electronic",
    "Pop",
    "Electronic",
  ].map((genre, index) => ({ name: `artist ${index}`, sightings: [], genre }));

  assert.deepEqual(countByGenre(artists), [
    { genre: "Electronic", artists: 3 },
    { genre: "Pop", artists: 1 },
    { genre: "Rock / Punk", artists: 1 },
  ]);
});
