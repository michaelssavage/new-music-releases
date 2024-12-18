import axios, { type AxiosResponse } from "axios";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import type { ArtistI, FollowedArtistsI } from "../types/spotify";
import { SPOTIFY_API_URL } from "../utils/constants";
import { getAccessToken } from "./getAccessToken";

dotenv.config();

const { MONGO_URI } = process.env;

const fetchFollowedArtists = async (accessToken: string) => {
	let artists: Array<ArtistI> = [];
	let nextUrl: string | null =
		`${SPOTIFY_API_URL}/me/following?type=artist&limit=50`;

	while (nextUrl) {
		const { data }: AxiosResponse<FollowedArtistsI> = await axios.get(nextUrl, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		artists = artists.concat(data.artists.items);
		nextUrl = data.artists.next;
	}

	console.log("Artists fetched from spotify.");

	return artists.map((artist) => ({
		id: artist.id,
		name: artist.name,
		uri: artist.uri,
	}));
};

const saveArtistsToMongo = async (artists: Array<ArtistI>) => {
	const client = new MongoClient(MONGO_URI as string);
	try {
		await client.connect();
		const db = client.db("spotify");
		const collection = db.collection("saved_artists");

		// Replace existing artists
		await collection.deleteMany({});
		await collection.insertMany(artists);

		console.log(`${artists.length} Artists saved to MongoDB.`);
	} finally {
		await client.close();
	}
};

(async () => {
	const accessToken = await getAccessToken();
	const artists = await fetchFollowedArtists(accessToken);
	await saveArtistsToMongo(artists);
})();
