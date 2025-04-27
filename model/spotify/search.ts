import type { Album, Artist, Track } from "./liked-tracks";

export interface SearchResponse {
	tracks: Array<Track>;
	artists: Array<Artist>;
	albums: Array<Album>;
}

export interface SearchProps {
	search: string;
	type: string[];
	limit?: number;
}
