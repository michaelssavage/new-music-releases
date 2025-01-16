import { SchedulerService } from "@server/service/scheduler.service";

export function SchedulerController() {
	const schedulerService = SchedulerService();

	schedulerService.initialize().catch((err) => {
		console.error("Failed to initialize SchedulerService:", err);
	});

	async function triggerManualUpdate() {
		try {
			await schedulerService.executeJob({ manual: true });
		} catch (error) {
			console.error("Failed to execute job:", error);
		}
	}

	return {
		triggerManualUpdate,
	};
}
