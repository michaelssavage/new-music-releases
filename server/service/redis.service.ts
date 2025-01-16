import { Redis as UpstashRedis } from "@upstash/redis";
import Redis from "ioredis";

interface RedisServiceConfig {
	redisUrl: string;
	redisToken: string;
	redisPort: string;
}

export function RedisService({
	redisUrl,
	redisToken,
	redisPort,
}: RedisServiceConfig) {
	const redis = new Redis(
		`rediss://default:${redisToken}@${redisUrl}:${redisPort}`,
	);

	const upstashRedis = new UpstashRedis({
		url: `https://${redisUrl}`,
		token: redisToken,
	});

	redis.on("error", (err) => {
		console.error("Redis connection error:", err);
		throw err;
	});

	redis.on("connect", () => {
		console.log("Connected to Redis.");
	});

	async function getCachedData(key: string) {
		const cache = await redis.get(key);
		if (cache) {
			console.log(`Cache hit for key: ${key}`);
			return JSON.parse(cache);
		}
		console.log(`Cache miss for key: ${key}`);
		return null;
	}

	async function setCache(key: string, value: unknown, ttl = 3600) {
		console.log(`Setting cache for key: ${key}`);
		await redis.set(key, JSON.stringify(value), "EX", ttl);
	}

	async function getUpstashData(key: string) {
		const cache = await upstashRedis.get(key);
		if (cache) {
			console.log(`Upstash cache hit for key: ${key}`);
			return cache;
		}
		console.log(`Upstash cache miss for key: ${key}`);
		return null;
	}

	async function setUpstashData(key: string, value: unknown, ttl = 3600) {
		console.log(`Setting Upstash cache for key: ${key}`);
		await upstashRedis.set(key, JSON.stringify(value), { ex: ttl });
	}

	async function invalidateCache(key: string) {
		console.log(`Invalidating cache for key: ${key}`);
		await Promise.all([redis.del(key), upstashRedis.del(key)]);
	}

	async function invalidateMultipleKeys(keys: string[]) {
		console.log("Invalidating cache for keys:", keys);
		await Promise.all([
			redis.del(keys),
			...keys.map((key) => upstashRedis.del(key)),
		]);
	}

	return {
		getCachedData,
		setCache,
		getUpstashData,
		setUpstashData,
		invalidateCache,
		invalidateMultipleKeys,
	};
}
