import type { SchedulerRouterI } from "@server/container/types";
import { createAccessMiddleware } from "@server/middleware/access.middleware";
import { SchedulerController } from "@server/controller/scheduler.controller";
import express from "express";

export function SchedulerRouter({
  schedulerService,
  spotifyService,
  env,
}: SchedulerRouterI) {
  const router = express.Router();
  const schedulerController = SchedulerController({ schedulerService, env });

  router.post("/trigger-schedule", schedulerController.triggerManualUpdate);
  router.get(
    "/scheduler-runs",
    createAccessMiddleware(spotifyService).requireAdmin,
    schedulerController.getRecentRuns,
  );

  return router;
}
