import type { Request, Response } from "express";
import type { SchedulerControllerI } from "../container/types";

export function SchedulerController({
	schedulerService,
}: SchedulerControllerI) {
	async function triggerManualUpdate(
		req: Request,
		res: Response,
	): Promise<void> {
		const { fromDate } = req.body;

		try {
			await schedulerService.executeJob({ manual: true, fromDate });
			res.status(200).json({ message: "Job triggered successfully" });
		} catch (error) {
			console.error("Failed to execute job:", error);
		}
	}

	return {
		triggerManualUpdate,
	};
}
