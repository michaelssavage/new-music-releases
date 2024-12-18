export interface ArtistI {
  id: string;
  name: string;
  uri: string;
}

export interface FollowedArtistsI {
  artists: {
    items: Array<ArtistI>;
    next: string | null;
  };
}

export interface AlbumI {
  name: string;
  release_date: string;
  uri: string;
}

export interface ArtistAlbumsI {
  items: Array<AlbumI>;
}


export interface NewReleasesI {
  artist: string;
}