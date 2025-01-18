import type { SchedulerControllerI } from "@server/container/types";
import { SchedulerController } from "@server/controller/scheduler.controller";
import express from "express";

export function SchedulerRouter({ schedulerService }: SchedulerControllerI) {
	const router = express.Router();
	const schedulerController = SchedulerController({ schedulerService });

	router.post("/trigger-schedule", schedulerController.triggerManualUpdate);

	return router;
}
