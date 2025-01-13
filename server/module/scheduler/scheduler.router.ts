import { SchedulerController } from "@server/module/scheduler/scheduler.controller";
import express from "express";

const router = express.Router();
const schedulerController = SchedulerController();

router.get("/trigger-schedule", schedulerController.triggerManualUpdate);

export default router;
