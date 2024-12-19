export interface SearchResponse {
	tracks: Array<Track>;
	artists: Array<Artist>;
	albums: Album[];
}

interface Track {
	album: Album;
	artists: Array<Artist>;
	available_markets: string[];
	disc_number: number;
	duration_ms: number;
	explicit: boolean;
	external_ids: {
		isrc: string;
		ean: string;
		upc: string;
	};
	external_urls: {
		spotify: string;
	};
	href: string;
	id: string;
	is_playable: boolean;
	linked_from: object;
	restrictions: {
		reason: string;
	};
	name: string;
	popularity: number;
	preview_url: string;
	track_number: number;
	type: string;
	uri: string;
	is_local: boolean;
}

interface Artist {
	external_urls: {
		spotify: string;
	};
	followers: {
		href: string;
		total: number;
	};
	genres: string[];
	href: string;
	id: string;
	images: Array<Image>;
	name: string;
	popularity: number;
	type: string;
	uri: string;
}

interface Album {
	album_type: string;
	total_tracks: number;
	available_markets: string[];
	external_urls: {
		spotify: string;
	};
	href: string;
	id: string;
	images: Array<Image>;
	name: string;
	release_date: string;
	release_date_precision: string;
	restrictions: {
		reason: string;
	};
	type: string;
	uri: string;
	artists: Array<Artist>;
}

interface Image {
	url: string;
	height: number;
	width: number;
}
