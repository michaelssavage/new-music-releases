import type { SavedArtistI } from "@model/spotify";
import type { Artist } from "@model/spotify/liked-tracks";
import type { SpotifyPlaylistI } from "@model/spotify/playlist";
import type { User } from "@model/spotify/user";
import { logger } from "@server/utils/logger";
import { type Collection, type Db, MongoClient } from "mongodb";

interface SpotifyRepositoryI {
	mongoUri: string;
}

export function SpotifyRepository({ mongoUri }: SpotifyRepositoryI) {
	let client: MongoClient;
	let db: Db;
	let userDb: Collection<User>;
	let artistDb: Collection<Artist & { userId: string }>;
	let playlistDb: Collection<SpotifyPlaylistI & { userId: string }>;

	async function connect(): Promise<void> {
		client = new MongoClient(mongoUri);
		await client.connect();

		db = client.db("spotify");
		userDb = db.collection("users");
		artistDb = db.collection("saved_artists");
		playlistDb = db.collection("playlist");
		logger.info("Connected to MongoDB.");
	}

	async function disconnect(): Promise<void> {
		if (client) {
			await client.close();
			logger.info("Disconnected from MongoDB.");
		}
	}

	async function saveUser(userData: User) {
		return await userDb.updateOne(
			{ userId: String(userData.userId) },
			{ $set: userData },
			{ upsert: true },
		);
	}

	async function getUser(userId: string) {
		return await userDb.findOne<User>({ userId: String(userId) });
	}

	async function getAllUsers() {
		return await userDb.find<User>({}).toArray();
	}

	async function saveArtists(userId: string, artists: Array<SavedArtistI>) {
		logger.info(
			`${userId} is saving artists: ${artists.map(({ name }) => name)}`,
		);

		const bulkOperations = artists.map((artist) => ({
			updateOne: {
				filter: { id: artist.id },
				update: { $set: artist },
				upsert: true,
			},
		}));
		await artistDb.bulkWrite(bulkOperations);

		const artistIds = artists.map((artist) => artist.id);
		return await userDb.updateOne(
			{ userId },
			{ $addToSet: { saved_artists: { $each: artistIds } } },
			{ upsert: true },
		);
	}

	async function removeSavedArtist(userId: string, artistId: string) {
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
		if (!user?.saved_artists || user.saved_artists.length === 0) {
			return [];
		}

		return await artistDb
			.find<SavedArtistI>({ id: { $in: user.saved_artists } })
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
		getAllUsers,
		saveArtists,
		removeSavedArtist,
		getAllArtists,
		getPlaylist,
		createPlaylist,
	};
}
