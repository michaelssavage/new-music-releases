import {
  type Collection,
  type Db,
  type InsertOneResult,
  MongoClient,
  type WithId,
} from "mongodb";

const MAX_STORED_LOGS = 100;

interface SchedulerLog {
  executionTime: Date;
  status: "SUCCESS" | "FAILED";
  duration: number;
  error?: string;
  createdAt: Date;
}

export function SchedulerRepository(mongoUri: string) {
  let db: Db;
  let collection: Collection<SchedulerLog>;

  async function connect() {
    if (!db) {
      const client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db("scheduler");
      collection = db.collection("logs");
    }
  }

  async function createIndex({
    executionTime,
  }: {
    executionTime: number;
  }): Promise<void> {
    await connect();
    await collection.createIndex({ executionTime });
  }

  async function insertOne(
    document: SchedulerLog,
  ): Promise<InsertOneResult<SchedulerLog>> {
    await connect();
    const result = await collection.insertOne(document);
    await deleteLogsBeyondLimit();
    return result;
  }

  async function deleteLogsBeyondLimit() {
    const oldest = await collection
      .find({}, { projection: { _id: 1 } })
      .sort({ executionTime: -1 })
      .skip(MAX_STORED_LOGS)
      .toArray();

    if (oldest.length === 0) return;
    await collection.deleteMany({ _id: { $in: oldest.map(({ _id }) => _id) } });
  }

  async function findOne(
    query: object,
    options?: object,
  ): Promise<SchedulerLog | null> {
    await connect();
    return collection.findOne<SchedulerLog>(query, options);
  }

  async function findRecent(
    limit: number,
  ): Promise<Array<WithId<SchedulerLog>>> {
    await connect();
    return collection.find().sort({ executionTime: -1 }).limit(limit).toArray();
  }

  return {
    createIndex,
    insertOne,
    findOne,
    findRecent,
    connect,
  };
}
