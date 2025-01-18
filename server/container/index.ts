import { SchedulerRepository } from "@server/repository/scheduler.repository";
import { SpotifyRepository } from "@server/repository/spotify.repository";
import { RedisService } from "@server/service/redis.service";
import { SchedulerService } from "@server/service/scheduler.service";
import { SpotifyService } from "@server/service/spotify.sevice";
import { validateEnv } from "@server/utils/validateEnv";
import type { ServiceContainer } from "./types";

export function createServiceContainer(): ServiceContainer {
	const env = validateEnv();

	// Create single instances of all services
	const redisService = RedisService({
		redisUrl: env.REDIS_URL,
		redisToken: env.REDIS_TOKEN,
		redisPort: env.REDIS_PORT,
	});

	const repository = SpotifyRepository({
		mongoUri: env.MONGO_URI,
	});

	const spotifyService = SpotifyService({
		repository,
		redisService,
		env,
	});

	const schedulerRepository = SchedulerRepository(env.MONGO_URI);

	const schedulerService = SchedulerService({
		repository: schedulerRepository,
		spotifyService,
	});

	return {
		redisService,
		spotifyService,
		schedulerService,
	};
}
