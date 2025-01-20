import type { SchedulerServiceI } from "@server/container/types";
import { CronJob } from "cron";

interface ExecuteJobProps {
	manual?: boolean;
	fromDate?: string;
}

export function SchedulerService({
	repository,
	spotifyService,
}: SchedulerServiceI) {
	let isJobRunning = false;

	const job = new CronJob(
		"0 22 * * *", // Run at 22:00 every day
		async () => {
			await executeJob({ manual: false });
		},
		null,
		false,
		"Europe/Madrid",
	);

	async function initialize(): Promise<void> {
		try {
			// Create index on executionTime if it doesn't exist
			await repository.createIndex({ executionTime: -1 });

			// Check if we missed any updates during downtime
			const lastExecution = await repository.findOne(
				{},
				{ sort: { executionTime: -1 } },
			);

			const now = new Date();
			const timeSinceLastRun = lastExecution
				? now.getTime() - lastExecution.executionTime.getTime()
				: Number.POSITIVE_INFINITY;

			if (timeSinceLastRun > 24 * 60 * 60 * 1000) {
				console.log("Missed update detected, triggering immediate update...");
				await executeJob({ manual: false });
			}

			job.start();
			console.log("Scheduler initialized successfully");
		} catch (error) {
			console.error("Failed to initialize scheduler:", error);
			throw error;
		}
	}

	async function shutdown(): Promise<void> {
		job.stop();
		console.log("Scheduler shut down successfully");
	}

	async function executeJob({ manual, fromDate }: ExecuteJobProps) {
		if (isJobRunning) {
			console.log("Previous job still running, skipping...");
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
				console.log("Last execution was too recent, skipping...");
				return;
			}

			console.log("Starting playlist update...");
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

	return { initialize, shutdown, executeJob };
}
