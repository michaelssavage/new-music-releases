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
  genre?: string;
}

export interface SeenArtistWithGenreI {
  name: string;
  sightings: Array<SightingI>;
  genre: string;
}

export interface GenreCountI {
  genre: string;
  artists: number;
}

export interface SeenArtistsResponse {
  artists: Array<SeenArtistWithGenreI>;
  genres: Array<GenreCountI>;
}
