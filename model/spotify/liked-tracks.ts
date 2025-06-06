export interface LikedTracksI {
	href: string;
	limit: number;
	next: string | null;
	offset: number;
	previous: string | null;
	total: number;
	items: Array<ShowItem>;
}

export interface ShowItem {
	added_at: string;
	track: Track;
}

export interface Track {
	album: Album;
	artists: Array<Artist>;
	available_markets: Array<string>;
	disc_number: number;
	duration_ms: number;
	explicit: boolean;
	external_ids: ExternalIds;
	external_urls: ExternalUrls;
	href: string;
	id: string;
	is_playable: boolean;
	linked_from?: object;
	restrictions?: Restrictions;
	name: string;
	popularity: number;
	preview_url: string | null;
	track_number: number;
	type: string;
	uri: string;
	is_local: boolean;
}

export interface Album {
	album_type: string;
	total_tracks: number;
	available_markets: Array<string>;
	external_urls: ExternalUrls;
	href: string;
	id: string;
	images: Array<Image>;
	name: string;
	release_date: string;
	release_date_precision: string;
	restrictions?: Restrictions;
	type: string;
	uri: string;
	artists: Array<Artist>;
}

export interface Artist {
	external_urls: {
		spotify: string;
	};
	followers: {
		href: string;
		total: number;
	};
	genres: Array<string>;
	href: string;
	id: string;
	images: Array<Image>;
	name: string;
	popularity: number;
	type: string;
	uri: string;
}

export interface ExternalUrls {
	spotify: string;
}

export interface Image {
	url: string;
	height: number;
	width: number;
}

export interface ExternalIds {
	isrc: string;
	ean: string;
	upc: string;
}

export interface Restrictions {
	reason: string;
}
