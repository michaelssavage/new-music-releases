import axios, { type AxiosResponse } from "axios";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import type {
	ArtistAlbumsI,
	ArtistI,
	FollowedArtistsI,
	NewReleasesI,
} from "src/types/spotify.ts";
import { SPOTIFY_API_URL } from "src/utils/constants.ts";

dotenv.config();

const {
	MONGO_URI,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET,
	SPOTIFY_REFRESH_TOKEN,
} = process.env;

const getAccessToken = async () => {
	const client = new MongoClient(MONGO_URI as string);

	try {
		await client.connect();
		const db = client.db("spotify");
		const tokensCollection = db.collection("tokens");

		const tokenDoc = await tokensCollection.findOne({});
		if (tokenDoc && new Date(tokenDoc.expires_at) > new Date()) {
			return tokenDoc.access_token;
		}

		const { data } = await axios.post(
			"https://accounts.spotify.com/api/token",
			new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: SPOTIFY_REFRESH_TOKEN as string,
			}),
			{
				headers: {
					Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
			},
		);

		const expiresAt = new Date();
		expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

		await tokensCollection.updateOne(
			{},
			{
				$set: {
					access_token: data.access_token,
					expires_at: expiresAt.toISOString(),
				},
			},
			{ upsert: true },
		);

		return data.access_token;
	} catch (error) {
		console.error("Error fetching access token:", error);
		throw error;
	} finally {
		await client.close();
	}
};

const searchItem = async (query: string, type: Array<string>, limit = 10) => {
	const accessToken = await getAccessToken();

	try {
		const { data } = await axios.get(
			`${SPOTIFY_API_URL}/search?q=${query}&type=${type.join(",")}&limit=${limit}`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);
		console.log("Search results:", data);
		return data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Error searching spotify:",
				error.response?.data || error.message,
			);
		}
		return {
			total: 0,
			items: [],
		};
	}
};

const overwriteArtists = async (artists: Array<ArtistI>) => {
	const client = new MongoClient(MONGO_URI as string);

	try {
		await client.connect();
		const db = client.db("spotify");
		const collection = db.collection("saved_artists");

		await collection.deleteMany({});
		await collection.insertMany(artists);

		console.log(`${artists.length} Artists saved to MongoDB.`);
	} finally {
		await client.close();
	}
};

const addOrUpdateArtists = async (artists: Array<ArtistI>) => {
	const client = new MongoClient(MONGO_URI as string);

	try {
		await client.connect();
		const db = client.db("spotify");
		const collection = db.collection("saved_artists");

		const bulkOperations = artists.map((artist) => ({
			updateOne: {
				filter: { id: artist.id },
				update: { $set: artist },
				upsert: true,
			},
		}));

		if (bulkOperations.length > 0) {
			await collection.bulkWrite(bulkOperations);
			console.log(`${artists.length} Artists added/updated in MongoDB.`);
		} else {
			console.log("No artists provided for addition/update.");
		}
	} finally {
		await client.close();
	}
};

const getFollowedArtists = async (accessToken: string) => {
	let artists: Array<ArtistI> = [];

	try {
		let nextUrl: string | null =
			`${SPOTIFY_API_URL}/me/following?type=artist&limit=50`;

		while (nextUrl) {
			const { data }: AxiosResponse<FollowedArtistsI> = await axios.get(
				nextUrl,
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);
			artists = artists.concat(data.artists.items);
			nextUrl = data.artists.next;
		}

		console.log("Artists fetched from spotify.");

		return artists.map((artist) => ({
			id: artist.id,
			name: artist.name,
			uri: artist.uri,
		}));
	} catch (error) {
		console.error("Error fetching artists:", error);
		return artists;
	}
};

const getSingleArtist = async (id: string) => {
	try {
		const accessToken = await getAccessToken();

		const { data } = await axios.get(`${SPOTIFY_API_URL}/artists/${id}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		return data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Error fetching artist:",
				error.response?.data || error.message,
			);
		}
		return null;
	}
};

const getSavedArtists = async () => {
	const client = new MongoClient(MONGO_URI as string);

	try {
		await client.connect();
		const db = client.db("spotify");
		const collection = db.collection("saved_artists");

		const artists = await collection.find({}).toArray();
		return artists.map(({ id }) => id);
	} finally {
		await client.close();
	}
};

const addTracksToPlaylist = async (
	accessToken: string,
	tracks: string[],
	playlistId: string,
) => {
	if (tracks?.length === 0) {
		console.log("No tracks to add.");
		return;
	}
	try {
		console.log("Adding tracks to playlist", { playlistId, tracks });

		const { data } = await axios.post(
			`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
			{ uris: tracks },
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			},
		);
		console.log(`Tracks added to playlist! Snapshot ID: ${data.snapshot_id}`);
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Error adding tracks:",
				error.response?.data || error.message,
			);
		} else if (error instanceof Error) {
			console.error("Unexpected error:", error.message);
		} else {
			console.error("Unknown error occurred");
		}
	}
};

export const getAlbumTracks = async (accessToken: string, albumId: string) => {
	try {
		const { data } = await axios.get(
			`${SPOTIFY_API_URL}/albums/${albumId}/tracks`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);

		const tracks = data.items.map((track: { uri: string }) => track.uri);
		console.log("Album tracks returned:", tracks);
		return tracks;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Error fetching album tracks:",
				error.response?.data || error.message,
			);
		}
		return [];
	}
};

const getNewReleasesForArtist = async (
	accessToken: string,
	artistId: string,
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

const fetchNewReleases = async (accessToken: string) => {
	const client = new MongoClient(MONGO_URI as string);
	const newReleases: Array<NewReleasesI> = [];

	try {
		await client.connect();
		const db = client.db("spotify");
		const artists = await db.collection("saved_artists").find({}).toArray();

		console.log(`${artists.length} Artists retrieved from MongoDB.`);

		for (const artist of artists) {
			const releases = await getNewReleasesForArtist(accessToken, artist.id);
			for (const release of releases) {
				newReleases.push(release);
			}
		}

		return newReleases;
	} finally {
		await client.close();
	}
};

const createSpotifyPlaylist = async (accessToken: string) => {
	const userProfileResponse = await axios.get(`${SPOTIFY_API_URL}/me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	const userId = userProfileResponse.data.id;

	const { data } = await axios.post<{ id: string; name: string }>(
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

const getSpotifyPlaylist = async (accessToken: string) => {
	const client = new MongoClient(MONGO_URI as string);

	try {
		await client.connect();
		const db = client.db("spotify");
		const collection = db.collection("playlist");

		const existingPlaylist = await collection.findOne({});
		if (existingPlaylist) {
			console.log("Playlist found in MongoDB:", existingPlaylist.name);
			return existingPlaylist;
		}

		const newPlaylist = await createSpotifyPlaylist(accessToken);

		await collection.insertOne(newPlaylist);

		return newPlaylist;
	} finally {
		await client.close();
	}
};

const removeSavedArtist = async (id: string) => {
	const client = new MongoClient(MONGO_URI as string);

	try {
		await client.connect();
		const db = client.db("spotify");
		const collection = db.collection("saved_artists");

		await collection.deleteOne({ id });

		console.log(`Artist with id ${id} removed from MongoDB.`);
	} finally {
		await client.close();
	}
};

export default {
	getAccessToken,
	searchItem,
	overwriteArtists,
	addOrUpdateArtists,
	getFollowedArtists,
	addTracksToPlaylist,
	getAlbumTracks,
	getNewReleasesForArtist,
	fetchNewReleases,
	getSpotifyPlaylist,
	createSpotifyPlaylist,
	getSingleArtist,
	getSavedArtists,
	removeSavedArtist,
};
