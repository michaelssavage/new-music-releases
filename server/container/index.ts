import { SchedulerRepository } from "@server/repository/scheduler.repository";
import { SpotifyRepository } from "@server/repository/spotify.repository";
import { SchedulerService } from "@server/service/scheduler.service";
import { SpotifyService } from "@server/service/spotify.sevice";
import { validateEnv } from "@server/utils/validateEnv";
import type { ServiceContainer } from "./types";

export function createServiceContainer(): ServiceContainer {
	const env = validateEnv();

	const repository = SpotifyRepository({
		mongoUri: env.MONGO_URI,
	});

	const spotifyService = SpotifyService({
		repository,
		env,
	});

	const schedulerRepository = SchedulerRepository(env.MONGO_URI);

	const schedulerService = SchedulerService({
		repository: schedulerRepository,
		spotifyService,
	});

	return {
		spotifyService,
		schedulerService,
		env,
	};
}
