import { logger } from "@server/utils/logger";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SchedulerControllerI } from "../container/types";

interface JWTPayload {
  user: string;
  purpose: string;
}

export function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return new Date(`${value}T00:00:00.000Z`).toISOString().startsWith(value);
}

export function SchedulerController({
  schedulerService,
  env,
}: SchedulerControllerI) {
  async function triggerManualUpdate(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { fromDate } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "No authorization header" });
      return;
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      res.status(401).json({ error: "Invalid authorization format" });
      return;
    }

    try {
      if (!env.JWT_SECRET) {
        throw new Error("JWT_SECRET not configured");
      }

      const verified = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

      if (verified.user !== "michael" || verified.purpose !== "admin") {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      if (fromDate !== undefined && !isValidDateOnly(fromDate)) {
        res
          .status(400)
          .json({ error: "fromDate must be a valid YYYY-MM-DD date" });
        return;
      }

      logger.info("Triggering manual update", {
        fromDate: fromDate ? new Date(fromDate) : undefined,
      });

      const result = await schedulerService.executeJob({
        manual: true,
        fromDate,
      });
      res.status(200).json({ message: "Job triggered successfully", result });
    } catch (error) {
      console.error("Failed to execute job:", error);

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      res.status(500).json({ error: "Failed to update playlists" });
    }
  }

  return {
    triggerManualUpdate,
  };
}
