export const PLAYLIST_ROLES = ["releases", "tracker"] as const;

export type PlaylistRole = (typeof PLAYLIST_ROLES)[number];

export interface PlaylistSummaryI {
  id: string;
  name: string;
  external_urls: { spotify: string };
  owner: { id: string };
}

export type PlaylistSettingsResponse = Record<
  PlaylistRole,
  PlaylistSummaryI | null
>;

export interface UserPlaylistsResponse {
  playlists: Array<PlaylistSummaryI>;
}

export interface PlaylistNameInputI {
  name: string;
}

export interface PlaylistSelectionInputI {
  playlistId: string;
}
