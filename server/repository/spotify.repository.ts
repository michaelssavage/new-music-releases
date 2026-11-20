import type { SeenArtistI, StoredSeenArtistI } from "@model/seen-artists";
import type { SavedArtistI } from "@model/spotify";
import type { Artist } from "@model/spotify/liked-tracks";
import type { PlaylistRole } from "@model/playlist-settings";
import type { User } from "@model/spotify/user";
import { logger } from "@server/utils/logger";
import { type Collection, type Db, MongoClient, ObjectId } from "mongodb";

interface SpotifyRepositoryI {
  mongoUri: string;
}

export function SpotifyRepository({ mongoUri }: SpotifyRepositoryI) {
  let client: MongoClient;
  let db: Db;
  let userDb: Collection<User>;
  let artistDb: Collection<Artist & { userId: string }>;
  let seenArtistDb: Collection<SeenArtistI & { userId: string }>;

  async function connect(): Promise<void> {
    client = new MongoClient(mongoUri);
    await client.connect();

    db = client.db("spotify");
    userDb = db.collection("users");
    artistDb = db.collection("saved_artists");
    seenArtistDb = db.collection("seen_artists");
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

  async function setLastReleaseSyncAt(userId: string, syncedAt: Date) {
    return await userDb.updateOne(
      { userId: String(userId) },
      { $set: { lastReleaseSyncAt: syncedAt } },
    );
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

  function toStoredSeenArtist({
    _id,
    userId: _userId,
    ...artist
  }: SeenArtistI & { _id: ObjectId; userId: string }): StoredSeenArtistI {
    return { id: _id.toString(), ...artist };
  }

  async function getSeenArtists(userId: string) {
    const artists = await seenArtistDb
      .find({ userId })
      .sort({ name: 1 })
      .toArray();
    return artists.map(toStoredSeenArtist);
  }

  async function findSeenArtistById(userId: string, id: string) {
    const artist = await seenArtistDb.findOne({
      _id: new ObjectId(id),
      userId,
    });
    return artist ? toStoredSeenArtist(artist) : null;
  }

  async function findSeenArtistByName(userId: string, name: string) {
    const artist = await seenArtistDb.findOne(
      { userId, name },
      { collation: { locale: "en", strength: 2 } },
    );
    return artist ? toStoredSeenArtist(artist) : null;
  }

  async function insertSeenArtist(userId: string, artist: SeenArtistI) {
    await seenArtistDb.insertOne({ ...artist, userId });
  }

  async function replaceSeenArtist(
    userId: string,
    id: string,
    artist: SeenArtistI,
  ) {
    await seenArtistDb.replaceOne(
      { _id: new ObjectId(id), userId },
      { ...artist, userId },
    );
  }

  async function deleteSeenArtist(userId: string, id: string) {
    return await seenArtistDb.deleteOne({ _id: new ObjectId(id), userId });
  }

  async function insertMissingSeenArtists(
    userId: string,
    artists: Array<SeenArtistI>,
  ) {
    const bulkOperations = artists.map((artist) => ({
      updateOne: {
        filter: { userId, name: artist.name },
        update: { $setOnInsert: { ...artist, userId } },
        upsert: true,
      },
    }));
    return await seenArtistDb.bulkWrite(bulkOperations, {
      collation: { locale: "en", strength: 2 },
    });
  }

  async function setPlaylistId(
    userId: string,
    role: PlaylistRole,
    playlistId: string,
  ) {
    const field = `${role}PlaylistId` as const;
    return await userDb.updateOne(
      { userId },
      { $set: { [field]: playlistId } },
    );
  }

  async function setVerified(userId: string, verified: boolean) {
    return await userDb.updateOne({ userId }, { $set: { verified } });
  }

  return {
    connect,
    disconnect,
    saveUser,
    getUser,
    getAllUsers,
    setLastReleaseSyncAt,
    saveArtists,
    removeSavedArtist,
    getAllArtists,
    getSeenArtists,
    findSeenArtistById,
    findSeenArtistByName,
    insertSeenArtist,
    replaceSeenArtist,
    deleteSeenArtist,
    insertMissingSeenArtists,
    setPlaylistId,
    setVerified,
  };
}
