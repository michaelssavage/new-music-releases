import type { SpotifyPlaylistI } from "@model/spotify/playlist";
import type { Artist, SavedArtistI } from "@model/spotify/search";
import type { User } from "@model/spotify/user";
import { type Collection, type Db, MongoClient } from "mongodb";

let client: MongoClient;
let db: Db;
let userDb: Collection;
let artistDb: Collection;
let playlistDb: Collection;

export function SpotifyRepository(mongoUri: string) {
	async function connect(): Promise<void> {
		client = new MongoClient(mongoUri);
		await client.connect();

		db = client.db("spotify");
		userDb = db.collection("users");
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

	async function saveUser(userData: User) {
		return await userDb.updateOne(
			{ userId: userData.userId },
			{ $set: userData },
			{ upsert: true },
		);
	}

	async function getUser(userId: string) {
		return await userDb.findOne<User>({ userId });
	}

	async function fetchAndSaveArtists(userId: string, artists: Array<Artist>) {
		const bulkOperations = artists.map((artist) => ({
			updateOne: {
				filter: { userId, id: artist.id },
				update: { $set: { ...artist, userId } },
				upsert: true,
			},
		}));

		return await artistDb.bulkWrite(bulkOperations);
	}

	async function resetArtists(userId: string, artists: Array<SavedArtistI>) {
		await artistDb.deleteMany({ userId });
		return await artistDb.insertMany(
			artists.map((artist) => ({ ...artist, userId })),
		);
	}

	async function removeSavedArtist(userId: string, id: string) {
		const result = await artistDb.deleteOne({ userId, id });
		if (result.deletedCount === 0) {
			throw new Error(`Artist not found for user ${userId}`);
		}
		return result;
	}

	async function getAllArtists(userId: string) {
		return await artistDb.find<Artist>({ userId }).toArray();
	}

	async function getPlaylist(userId: string) {
		return await playlistDb.findOne<SpotifyPlaylistI>({ userId });
	}

	async function createPlaylist(userId: string, playlist: SpotifyPlaylistI) {
		return await playlistDb.insertOne({ ...playlist, userId });
	}

	return {
		connect,
		disconnect,
		saveUser,
		getUser,
		fetchAndSaveArtists,
		resetArtists,
		removeSavedArtist,
		getAllArtists,
		getPlaylist,
		createPlaylist,
	};
}
