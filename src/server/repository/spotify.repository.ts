import { type Collection, type Db, MongoClient } from "mongodb";
import type { SpotifyPlaylistI } from "src/types/spotify/playlist.ts";
import type { Artist } from "src/types/spotify/search.ts";

export function SpotifyRepository(mongoUri: string) {
	let client: MongoClient;
	let db: Db;
	let tokenDb: Collection;
	let artistDb: Collection;
	let playlistDb: Collection;

	async function connect(): Promise<void> {
		client = new MongoClient(mongoUri);
		await client.connect();
		db = client.db("spotify");
		tokenDb = db.collection("tokens");
		artistDb = db.collection("saved_artists");
		playlistDb = db.collection("playlist");
		console.log("Connected to MongoDB.");
	}

	async function disconnect(): Promise<void> {
		if (client) {
			await client.close();
			console.log("Disconnected from MongoDB.");
		}
	}

	async function getToken() {
		return await tokenDb.findOne({});
	}

	async function setToken(expires_in: number, access_token: string) {
		const expiresAt = new Date();
		expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

		return await tokenDb.updateOne(
			{},
			{
				$set: {
					access_token: access_token,
					expires_at: expiresAt.toISOString(),
				},
			},
			{ upsert: true },
		);
	}

	async function fetchAndSaveArtists(artists: Array<Artist>) {
		const bulkOperations = artists.map((artist) => ({
			updateOne: {
				filter: { id: artist.id },
				update: { $set: artist },
				upsert: true,
			},
		}));

		return await artistDb.bulkWrite(bulkOperations);
	}

	async function resetArtists(artists: Array<Artist>) {
		await artistDb.deleteMany({});
		return await artistDb.insertMany(artists);
	}

	async function removeSavedArtist(id: string) {
		return await artistDb.deleteOne({ id });
	}

	async function getAllArtists() {
		return await artistDb.find({}).toArray();
	}

	async function getPlaylist() {
		return await playlistDb.findOne<SpotifyPlaylistI>({});
	}

	async function createPlaylist(playlist: SpotifyPlaylistI) {
		return await playlistDb.insertOne(playlist);
	}

	return {
		connect,
		disconnect,
		getToken,
		setToken,
		fetchAndSaveArtists,
		resetArtists,
		removeSavedArtist,
		getAllArtists,
		getPlaylist,
		createPlaylist,
	};
}
