export interface ArtistI {
	id: string;
	name: string;
	uri: string;
}

export interface FollowedArtistsI {
	artists: {
		items: Array<ArtistI>;
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
	artists: Array<{ name: string; id: string; url: string }>;
	name: string;
	image: string;
	url: string;
}
