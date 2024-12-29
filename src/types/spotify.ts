import type { SpotifyPlaylistI } from "./spotify/playlist.ts";
import type { Artist } from "./spotify/search.ts";
import type { PlaylistTracksI } from "./spotify/tracks.ts";

export interface SpotifyDataProps {
	playlistItems: PlaylistTracksI;
	playlist: SpotifyPlaylistI;
}

export interface FollowedArtistsI {
	artists: {
		items: Array<Artist>;
		next: string | null;
	};
}

export interface AlbumI {
	id: string;
	name: string;
	release_date: string;
	uri: string;
	images: Array<{ url: string }>;
	external_urls: { spotify: string };
	artists: Array<{
		name: string;
		id: string;
		external_urls: { spotify: string };
	}>;
}

export interface ArtistAlbumsI {
	items: Array<AlbumI>;
}

export interface NewReleasesI {
	id: string;
	uri: string;
	artists: Array<{ name: string; id: string; url: string }>;
	name: string;
	image: string;
	url: string;
}
