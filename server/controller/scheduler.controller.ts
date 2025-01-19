import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SchedulerControllerI } from "../container/types";

interface JWTPayload {
	user: string;
	purpose: string;
}

export function SchedulerController({
	schedulerService,
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
			const secret = process.env.JWT_SECRET;
			if (!secret) {
				throw new Error("JWT_SECRET not configured");
			}

			const verified = jwt.verify(token, secret) as JWTPayload;

			if (verified.user !== "michael" || verified.purpose !== "admin") {
				res.status(403).json({ error: "Insufficient permissions" });
				return;
			}

			await schedulerService.executeJob({ manual: true, fromDate });
			res.status(200).json({ message: "Job triggered successfully" });
		} catch (error) {
			console.error("Failed to execute job:", error);

			if (error instanceof jwt.JsonWebTokenError) {
				res.status(401).json({ error: "Invalid token" });
			} else {
				res.status(500).json({ error: "Internal server error" });
			}
		}
	}

	return {
		triggerManualUpdate,
	};
}
