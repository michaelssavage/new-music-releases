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
		{
			lazyConnect: true,
			retryStrategy(times) {
				const delay = Math.min(times * 50, 2000);
				return delay;
			},
		},
	);

	const upstashRedis = new UpstashRedis({
		url: `https://${redisUrl}`,
		token: redisToken,
	});

	async function initialize(): Promise<void> {
		try {
			await redis.connect();

			redis.on("error", (err) => {
				console.error("Redis connection error:", err);
			});

			redis.on("connect", () => {
				console.log("Connected to Redis.");
			});

			redis.on("reconnecting", () => {
				console.log("Reconnecting to Redis...");
			});

			await upstashRedis.ping();
			console.log("Connected to Upstash Redis.");
		} catch (error) {
			console.error("Failed to initialize Redis services:", error);
			throw error;
		}
	}

	async function shutdown(): Promise<void> {
		try {
			console.log("Disconnecting from Redis...");
			await redis.quit();

			console.log("Redis connections closed.");
		} catch (error) {
			console.error("Error during Redis shutdown:", error);
			throw error;
		}
	}

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
			try {
				return JSON.parse(cache as string);
			} catch {
				return cache;
			}
		}
		console.log(`Upstash cache miss for key: ${key}`);
		return null;
	}

	async function setUpstashData(key: string, value: unknown, ttl = 3600) {
		console.log(`Setting Upstash cache for key: ${key}`);
		return await upstashRedis.set(key, JSON.stringify(value), { ex: ttl });
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
		initialize,
		shutdown,
		getCachedData,
		setCache,
		getUpstashData,
		setUpstashData,
		invalidateCache,
		invalidateMultipleKeys,
	};
}
