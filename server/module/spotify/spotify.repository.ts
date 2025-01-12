import type { SpotifyPlaylistI } from "@model/spotify/playlist";
import type { Artist } from "@model/spotify/search";
import type { User } from "@model/spotify/user";
import { type Collection, type Db, MongoClient } from "mongodb";

let client: MongoClient;
let db: Db;
let userDb: Collection<User>;
let artistDb: Collection<
	Artist & {
		userId: string;
	}
>;
let playlistDb: Collection<
	SpotifyPlaylistI & {
		userId: string;
	}
>;

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

	async function saveArtists(userId: string, artists: Array<Artist>) {
		// Add artist data to `saved_artists` collection
		const bulkOperations = artists.map((artist) => ({
			updateOne: {
				filter: { id: artist.id },
				update: { $set: artist },
				upsert: true,
			},
		}));
		await artistDb.bulkWrite(bulkOperations);

		// Add artist IDs to the user's `saved_artists` array
		const artistIds = artists.map((artist) => artist.id);
		return await userDb.updateOne(
			{ userId },
			{ $addToSet: { saved_artists: { $each: artistIds } } },
			{ upsert: true },
		);
	}

	async function resetArtists(userId: string, artists: Array<Artist>) {
		// Update the `saved_artists` collection with the new artist data
		const bulkOperations = artists.map((artist) => ({
			updateOne: {
				filter: { id: artist.id },
				update: { $set: artist },
				upsert: true,
			},
		}));
		await artistDb.bulkWrite(bulkOperations);

		// Replace the user's `saved_artists` array with the new artist IDs
		const artistIds = artists.map((artist) => artist.id);
		return await userDb.updateOne(
			{ userId },
			{ $set: { saved_artists: artistIds } },
			{ upsert: true },
		);
	}

	async function removeSavedArtist(userId: string, artistId: string) {
		// Remove the artist ID from the user's `saved_artists` array

		const result = await userDb.updateOne(
			{ userId },
			{ $pull: { saved_artists: artistId } },
		);

		if (result.modifiedCount === 0) {
			throw new Error(
				`Artist ID ${artistId} not found in user ${userId}'s saved artists.`,
			);
		}

		return result;
	}

	async function getAllArtists(userId: string) {
		const user = await userDb.findOne<{ saved_artists: Array<string> }>({
			userId,
		});
		if (!user || !user.saved_artists || user.saved_artists.length === 0) {
			return [];
		}

		return await artistDb
			.find<Artist>({ id: { $in: user.saved_artists } })
			.toArray();
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
		saveArtists,
		resetArtists,
		removeSavedArtist,
		getAllArtists,
		getPlaylist,
		createPlaylist,
	};
}
