export interface PlaylistTracksI {
	href: string;
	limit: number;
	next: string | null;
	offset: number;
	previous: string | null;
	total: number;
	items: ShowItem[];
}

interface ShowItem {
	added_at: string;
	added_by: {
		external_urls: {
			spotify: string;
		};
		followers: {
			href: string | null;
			total: number;
		};
		href: string;
		id: string;
		type: string;
		uri: string;
	};
	is_local: boolean;
	track: {
		album: {
			album_type: string;
			total_tracks: number;
			available_markets: string[];
			external_urls: {
				spotify: string;
			};
			href: string;
			id: string;
			images: AlbumImage[];
			name: string;
			release_date: string;
			release_date_precision: string;
			restrictions?: {
				reason: string;
			};
			type: string;
			uri: string;
			artists: Artist[];
		};
		artists: Artist[];
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
		linked_from?: Record<string, unknown>;
		restrictions?: {
			reason: string;
		};
		name: string;
		popularity: number;
		preview_url: string | null;
		track_number: number;
		type: string;
		uri: string;
		is_local: boolean;
	};
}

interface AlbumImage {
	url: string;
	height: number;
	width: number;
}

interface Artist {
	external_urls: {
		spotify: string;
	};
	href: string;
	id: string;
	name: string;
	type: string;
	uri: string;
}
