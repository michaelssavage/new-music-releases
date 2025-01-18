import type { SpotifyPlaylistI } from "@model/spotify/playlist";

export interface UpdateUserPlaylistI {
	userId: string;
	token: string;
	playlist: SpotifyPlaylistI;
	fromDate?: string;
}
