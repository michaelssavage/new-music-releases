import type {
  ArtistTagI,
  GenreCountI,
  SeenArtistI,
  SeenArtistWithGenreI,
} from "@model/seen-artists";

export const OTHER_GENRE = "Other";

// Order matters: a tag counts toward the first bucket that matches it,
// so "indie rock" is Indie rather than Rock.
const GENRE_KEYWORDS: Array<[genre: string, keywords: Array<string>]> = [
  [
    "Electronic",
    [
      "electronic",
      "electronica",
      "electro",
      "techno",
      "house",
      "uk garage",
      "future garage",
      "dubstep",
      "uk bass",
      "bass",
      "drum and bass",
      "breakbeat",
      "trance",
      "ambient",
      "idm",
      "acid",
      "nu disco",
      "edm",
      "minimal",
      "downtempo",
      "trip hop",
    ],
  ],
  ["Hip-hop", ["hip hop", "rap", "grime", "trap", "r b", "rnb"]],
  ["Folk / Trad", ["folk", "celtic", "trad", "traditional", "country"]],
  [
    "Indie / Alternative",
    [
      "indie",
      "alternative",
      "dream pop",
      "shoegaze",
      "lo fi",
      "bedroom pop",
      "singer songwriter",
    ],
  ],
  [
    "Rock / Punk",
    [
      "rock",
      "punk",
      "post punk",
      "crank wave",
      "grunge",
      "emo",
      "metal",
      "noise",
    ],
  ],
  ["Pop", ["pop", "synthpop", "soul", "funk", "disco"]],
];

export const GENRES = [...GENRE_KEYWORDS.map(([genre]) => genre), OTHER_GENRE];

function normalise(text: string) {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;
}

function genreOfTag(tagName: string) {
  const words = normalise(tagName);
  return GENRE_KEYWORDS.find(([, keywords]) =>
    keywords.some((keyword) => words.includes(normalise(keyword))),
  )?.[0];
}

export function primaryGenre(tags: Array<ArtistTagI>): string {
  const scores = new Map<string, number>();
  for (const { name, count } of tags) {
    const genre = genreOfTag(name);
    if (genre) scores.set(genre, (scores.get(genre) ?? 0) + count);
  }

  let best: { genre: string; score: number } | undefined;
  for (const [genre] of GENRE_KEYWORDS) {
    const score = scores.get(genre) ?? 0;
    if (score > (best?.score ?? 0)) best = { genre, score };
  }
  return best?.genre ?? OTHER_GENRE;
}

export function withPrimaryGenre(
  artists: Array<SeenArtistI>,
): Array<SeenArtistWithGenreI> {
  return artists.map(({ name, sightings, tags, genre }) => ({
    name,
    sightings,
    genre: genre ?? primaryGenre(tags),
  }));
}

export function countByGenre(
  artists: Array<SeenArtistWithGenreI>,
): Array<GenreCountI> {
  const counts = new Map<string, number>();
  for (const { genre } of artists) {
    counts.set(genre, (counts.get(genre) ?? 0) + 1);
  }

  return Array.from(counts, ([genre, count]) => ({
    genre,
    artists: count,
  })).sort((a, b) => b.artists - a.artists || a.genre.localeCompare(b.genre));
}
