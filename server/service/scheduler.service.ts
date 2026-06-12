import type { SchedulerServiceI } from "@server/container/types";
import { ARTIST_TRACKER_PLAYLIST_ID } from "@server/utils/constants";
import { logger } from "@server/utils/logger";

interface ExecuteJobProps {
  manual?: boolean;
  fromDate?: string;
}

export function SchedulerService({
  repository,
  spotifyService,
}: SchedulerServiceI) {
  let isJobRunning = false;

  async function executeJob({ manual, fromDate }: ExecuteJobProps) {
    if (isJobRunning) {
      logger.info("Previous job still running, skipping...");
      return;
    }

    isJobRunning = true;
    const startTime = new Date();

    try {
      const lastExecution = await repository.findOne(
        {},
        { sort: { executionTime: -1 } },
      );

      const now = new Date();
      const timeSinceLastRun = lastExecution
        ? now.getTime() - lastExecution.executionTime.getTime()
        : Number.POSITIVE_INFINITY;

      // if less than 20 hours since last successful run, skip
      if (timeSinceLastRun < 20 * 60 * 60 * 1000 && !manual) {
        logger.info("Last execution was too recent, skipping...");
        return;
      }

      logger.info("Starting Artist Tracker playlist sync...");
      await spotifyService.syncArtistsFromPlaylistForAllUsers(
        ARTIST_TRACKER_PLAYLIST_ID,
      );

      logger.info("Starting playlist update...");
      const result = await spotifyService.syncNewReleasesForAllUsers(fromDate);

      // Log successful execution
      await repository.insertOne({
        executionTime: startTime,
        status: "SUCCESS",
        duration: Date.now() - startTime.getTime(),
        createdAt: new Date(),
      });

      return result;
    } catch (error) {
      console.error("Failed to update playlists:", error);

      // Log failed execution
      await repository.insertOne({
        executionTime: startTime,
        status: "FAILED",
        duration: Date.now() - startTime.getTime(),
        error: error instanceof Error ? error.message : "Unknown error",
        createdAt: new Date(),
      });
    } finally {
      isJobRunning = false;
    }
  }

  return { executeJob };
}
