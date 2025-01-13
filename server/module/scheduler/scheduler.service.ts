import { CronJob } from "cron";
import { SpotifyService } from "../spotify/spotify.sevice";
import { SchedulerRepository } from "./scheduler.repository";

const { MONGO_URI } = process.env;

export function SchedulerService() {
	let isJobRunning = false;
	const repository = SchedulerRepository(MONGO_URI as string);
	const spotifyService = SpotifyService();

	const job = new CronJob(
		"0 22 * * *", // Run at 22:00 every day
		async () => {
			await executeJob();
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
				await executeJob();
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

	async function executeJob(): Promise<void> {
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

			// If less than 20 hours since last successful run, skip
			if (timeSinceLastRun < 20 * 60 * 60 * 1000) {
				console.log("Last execution was too recent, skipping...");
				return;
			}

			console.log("Starting playlist update...");
			await spotifyService.updatePlaylistsForAllUsers();

			// Log successful execution
			await repository.insertOne({
				executionTime: startTime,
				status: "SUCCESS",
				duration: Date.now() - startTime.getTime(),
				createdAt: new Date(),
			});

			console.log("Playlist update completed successfully");
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
