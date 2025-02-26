export interface RecommendationsParams {
	seed_artists: string;
	limit?: number;
	market?: string;
	min_popularity?: number;
	max_popularity?: number;
	target_energy?: number;
	target_danceability?: number;
	[key: string]: string | number | undefined;
}
