import axios, { type AxiosResponse } from "axios";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import type { ArtistAlbumsI, NewReleasesI } from "../types/spotify.ts";
import { SPOTIFY_API_URL } from "../utils/constants.ts";
import { getAccessToken } from "./getAccessToken.ts";

dotenv.config();

const { MONGO_URI } = process.env;

const getNewReleasesForArtist = async (
	artistId: string,
	accessToken: string,
) => {
	const { data }: AxiosResponse<ArtistAlbumsI> = await axios.get(
		`${SPOTIFY_API_URL}/artists/${artistId}/albums`,
		{
			headers: { Authorization: `Bearer ${accessToken}` },
			params: { include_groups: "single,album,appears_on", limit: 10 },
		},
	);

	const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
	return data.items
		.filter(({ release_date }) => release_date === today)
		.map((props) => ({
			id: props.id,
			uri: props.uri,
			artists: props.artists.map(({ name, id, external_urls }) => ({
				name,
				id,
				url: external_urls.spotify,
			})),
			name: props.name,
			image: props.images[0].url,
			url: props.external_urls.spotify,
		}));
};

export const fetchNewReleases = async (accessToken: string) => {
	const client = new MongoClient(MONGO_URI as string);
	const newReleases: Array<NewReleasesI> = [];

	try {
		await client.connect();
		const db = client.db("spotify");
		const artists = await db.collection("saved_artists").find({}).toArray();

		console.log(`${artists.length} Artists retrieved from MongoDB.`);

		for (const artist of artists) {
			const releases = await getNewReleasesForArtist(artist.id, accessToken);
			for (const release of releases) {
				newReleases.push(release);
			}
		}

		return newReleases;
	} finally {
		await client.close();
	}
};

(async () => {
	const accessToken = await getAccessToken();
	const newReleases = await fetchNewReleases(accessToken);
	console.log("New Releases:", newReleases);
})();
