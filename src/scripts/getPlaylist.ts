import axios from "axios";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { SPOTIFY_API_URL } from "../utils/constants";
import { getAccessToken } from "./getAccessToken";

dotenv.config();

const { MONGO_URI } = process.env;

const createPlaylistInSpotify = async (accessToken: string) => {
	const userProfileResponse = await axios.get(`${SPOTIFY_API_URL}/me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	const userId = userProfileResponse.data.id;

	const { data } = await axios.post(
		`${SPOTIFY_API_URL}/users/${userId}/playlists`,
		{
			name: "New Music Releases",
			description: "A playlist of today's new releases.",
			public: true,
		},
		{ headers: { Authorization: `Bearer ${accessToken}` } },
	);

	console.log("Playlist created in Spotify:", data);

	return { id: data.id, name: data.name };
};

export const getPlaylist = async (accessToken: string) => {
	const client = new MongoClient(MONGO_URI as string);

	try {
		await client.connect();
		const db = client.db("spotify");
		const collection = db.collection("playlist");

		// Check if the playlist exists in MongoDB
		const existingPlaylist = await collection.findOne({});
		if (existingPlaylist) {
			console.log("Playlist found in MongoDB:", existingPlaylist.name);
			return existingPlaylist;
		}

		// If not found, create a new playlist in Spotify
		const newPlaylist = await createPlaylistInSpotify(accessToken);

		// Save the new playlist to MongoDB
		await collection.insertOne(newPlaylist);

		return newPlaylist;
	} finally {
		await client.close();
	}
};

(async () => {
	const accessToken = await getAccessToken();
	const playlist = await getPlaylist(accessToken);
	console.log("My Spotify Playlist:", playlist);
})();
