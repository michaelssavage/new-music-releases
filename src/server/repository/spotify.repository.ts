import { type Collection, type Db, MongoClient } from "mongodb";
import type { SpotifyPlaylistI } from "types/spotify/playlist.ts";
import type { Artist } from "types/spotify/search.ts";

export function SpotifyRepository(mongoUri: string) {
	let client: MongoClient;
	let db: Db;
	let artistDb: Collection;
	let playlistDb: Collection;

	async function connect(): Promise<void> {
		client = new MongoClient(mongoUri);
		await client.connect();
		db = client.db("spotify");
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
		fetchAndSaveArtists,
		resetArtists,
		removeSavedArtist,
		getAllArtists,
		getPlaylist,
		createPlaylist,
	};
}
