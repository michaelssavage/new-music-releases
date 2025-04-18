import type { SchedulerRepository } from "@server/repository/scheduler.repository";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SchedulerService } from "@server/service/scheduler.service";
import type { SpotifyService } from "@server/service/spotify.sevice";
import type { EnvVars } from "@server/utils/validateEnv";

export interface ServiceContainer {
	spotifyService: ReturnType<typeof SpotifyService>;
	schedulerService: ReturnType<typeof SchedulerService>;
	env: EnvVars;
}

export interface SpotifyControllerI {
	spotifyService: ReturnType<typeof SpotifyService>;
	env: EnvVars;
}

export interface SpotifyServiceI {
	repository: ReturnType<typeof SpotifyRepository>;
	env: EnvVars;
}

export interface SchedulerControllerI {
	schedulerService: ReturnType<typeof SchedulerService>;
	env: EnvVars;
}

export interface SchedulerServiceI {
	repository: ReturnType<typeof SchedulerRepository>;
	spotifyService: ReturnType<typeof SpotifyService>;
}
