import type { SchedulerRepository } from "@server/repository/scheduler.repository";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SchedulerService } from "@server/service/scheduler.service";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import type { SpotifyService } from "@server/service/spotify.service";
import type { EnvVars } from "@server/utils/validateEnv";

export interface ServiceContainer {
  spotifyService: ReturnType<typeof SpotifyService>;
  schedulerService: ReturnType<typeof SchedulerService>;
  api: SpotifyWebApi;
  env: EnvVars;
}

export interface SpotifyControllerI {
  spotifyService: ReturnType<typeof SpotifyService>;
  api: SpotifyWebApi;
  env: EnvVars;
}

export interface SpotifyServiceI {
  repository: ReturnType<typeof SpotifyRepository>;
  env: EnvVars;
  api: SpotifyWebApi;
}

export interface SchedulerControllerI {
  schedulerService: ReturnType<typeof SchedulerService>;
  env: EnvVars;
}

export interface SchedulerServiceI {
  repository: ReturnType<typeof SchedulerRepository>;
  spotifyService: ReturnType<typeof SpotifyService>;
}
