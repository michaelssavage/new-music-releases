export interface SpotifyPlaylistI {
	collaborative: boolean;
	description: string;
	external_urls: {
		spotify: string;
	};
	followers: {
		href: string | null;
		total: number;
	};
	href: string;
	id: string;
	images: Array<{
		url: string;
		height: number | null;
		width: number | null;
	}>;
	name: string;
	owner: {
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
		display_name: string;
	};
	public: boolean;
	snapshot_id: string;
	tracks: {
		href: string;
		limit: number;
		next: string | null;
		offset: number;
		previous: string | null;
		total: number;
		items: Array<{
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
					images: Array<{
						url: string;
						height: number | null;
						width: number | null;
					}>;
					name: string;
					release_date: string;
					release_date_precision: string;
					restrictions?: {
						reason: string;
					};
					type: string;
					uri: string;
					artists: Array<{
						external_urls: {
							spotify: string;
						};
						href: string;
						id: string;
						name: string;
						type: string;
						uri: string;
					}>;
				};
				artists: Array<{
					external_urls: {
						spotify: string;
					};
					href: string;
					id: string;
					name: string;
					type: string;
					uri: string;
				}>;
				available_markets: string[];
				disc_number: number;
				duration_ms: number;
				explicit: boolean;
				external_ids: {
					isrc?: string;
					ean?: string;
					upc?: string;
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
		}>;
	};
	type: string;
	uri: string;
}
