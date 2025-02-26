import type { Track } from "./spotify/liked-tracks";
import type { SpotifyPlaylistI } from "./spotify/playlist";
import type { Artist } from "./spotify/search";
import type { PlaylistTracksI } from "./spotify/tracks";

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
	artists: Array<Artist>;
}

export interface ArtistAlbumsI {
	total: number;
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

export interface SavedArtistI {
	id: string;
	name: string;
	image: string;
	uri: string;
	createdDate: Date;
}

export interface RecommendationResponse {
	seeds: Array<{
		id: string;
		type: "artist" | "track" | "genre";
		initialPoolSize: number;
		afterFilteringSize: number;
		afterRelinkingSize: number;
	}>;
	tracks: Array<Track>;
}
