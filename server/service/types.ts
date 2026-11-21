export interface UpdateUserPlaylistI {
  userId: string;
  token: string;
  playlistId: string;
  fromDate?: string;
}

export interface SaveSongToPlaylistI {
  playlistId: string;
  spotifyAccessToken: string;
  trackId: string;
}
