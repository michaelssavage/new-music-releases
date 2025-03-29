export interface SpotifyUserProfile {
	country: string;
	display_name: string;
	email: string;
	explicit_content: {
		filter_enabled: boolean;
		filter_locked: boolean;
	};
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
		height: number;
		width: number;
	}>;
	product: string;
	type: string;
	uri: string;
}

export interface User {
	userId: string;
	access_token: string;
	refresh_token: string;
	profile: SpotifyUserProfile;
	saved_artists: Array<string>;
	listen_later_playlist?: string;
}

export type UserID = string | null;
