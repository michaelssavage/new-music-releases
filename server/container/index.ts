import { SchedulerRepository } from "@server/repository/scheduler.repository";
import { SpotifyRepository } from "@server/repository/spotify.repository";
import { SchedulerService } from "@server/service/scheduler.service";
import { createSpotifyWebApi } from "@server/service/spotify-api";
import { SpotifyService } from "@server/service/spotify.service";
import { validateEnv } from "@server/utils/validateEnv";
import type { ServiceContainer } from "./types";

export function createServiceContainer(): ServiceContainer {
  const env = validateEnv();
  const spotifyApi = createSpotifyWebApi();

  const repository = SpotifyRepository({ mongoUri: env.MONGO_URI });

  const spotifyService = SpotifyService({ repository, env, api: spotifyApi });

  const schedulerRepository = SchedulerRepository(env.MONGO_URI);

  const schedulerService = SchedulerService({
    repository: schedulerRepository,
    spotifyService,
  });

  return {
    spotifyService,
    schedulerService,
    api: spotifyApi,
    env,
  };
}
