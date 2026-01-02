import type { SchedulerRepository } from "@server/repository/scheduler.repository";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SchedulerService } from "@server/service/scheduler.service";
import type { SpotifyApi } from "@server/service/spotify.api.service";
import type { SpotifyService } from "@server/service/spotify.sevice";
import type { EnvVars } from "@server/utils/validateEnv";

export interface ServiceContainer {
  spotifyService: ReturnType<typeof SpotifyService>;
  schedulerService: ReturnType<typeof SchedulerService>;
  api: ReturnType<typeof SpotifyApi>;
  env: EnvVars;
}

export interface SpotifyControllerI {
  spotifyService: ReturnType<typeof SpotifyService>;
  api: ReturnType<typeof SpotifyApi>;
  env: EnvVars;
}

export interface SpotifyServiceI {
  repository: ReturnType<typeof SpotifyRepository>;
  env: EnvVars;
  api: ReturnType<typeof SpotifyApi>;
}

export interface SchedulerControllerI {
  schedulerService: ReturnType<typeof SchedulerService>;
  env: EnvVars;
}

export interface SchedulerServiceI {
  repository: ReturnType<typeof SchedulerRepository>;
  spotifyService: ReturnType<typeof SpotifyService>;
}
