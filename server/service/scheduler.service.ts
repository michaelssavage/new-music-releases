import type { SchedulerServiceI } from "@server/container/types";
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

			logger.info("Starting playlist update...");
			const result = await spotifyService.updatePlaylistsForAllUsers(fromDate);

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
