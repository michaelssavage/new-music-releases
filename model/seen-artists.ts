export const GENRES = [
  "Electronic",
  "Hip-hop",
  "Folk / Trad",
  "Indie / Alternative",
  "Rock / Punk",
  "Pop",
  "Other",
] as const;

// The built-in buckets (GENRES) are what tags map to automatically;
// a genre override can be any name.
export type Genre = string;

export const OTHER_GENRE: Genre = "Other";

export interface SightingI {
  event: string;
  year: number;
}

export interface ArtistTagI {
  name: string;
  count: number;
}

export interface SeenArtistI {
  name: string;
  sightings: Array<SightingI>;
  tags: Array<ArtistTagI>;
  genreOverride?: Genre;
}

export interface StoredSeenArtistI extends SeenArtistI {
  id: string;
}

export interface SeenArtistInputI {
  name: string;
  sightings: Array<SightingI>;
  genreOverride?: Genre;
}

export interface SeenArtistWithGenreI {
  id: string;
  name: string;
  sightings: Array<SightingI>;
  genre: Genre;
  automaticGenre: Genre;
  genreOverride?: Genre;
}

export interface GenreCountI {
  genre: Genre;
  artists: number;
}

export interface SeenArtistsResponse {
  artists: Array<SeenArtistWithGenreI>;
  genres: Array<GenreCountI>;
}
