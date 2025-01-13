import {
	type Collection,
	type Db,
	type InsertOneResult,
	MongoClient,
} from "mongodb";

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
	}: { executionTime: number }): Promise<void> {
		await connect();
		await collection.createIndex({ executionTime });
	}

	async function insertOne(
		document: SchedulerLog,
	): Promise<InsertOneResult<SchedulerLog>> {
		await connect();
		return await collection.insertOne(document);
	}

	async function findOne(
		query: object,
		options?: object,
	): Promise<SchedulerLog | null> {
		await connect();
		return collection.findOne<SchedulerLog>(query, options);
	}

	return {
		createIndex,
		insertOne,
		findOne,
		connect,
	};
}
