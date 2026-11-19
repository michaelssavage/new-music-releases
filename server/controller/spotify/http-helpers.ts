import { requireSpotifyToken } from "@server/utils/auth";
import { HttpException } from "@server/utils/exceptions";
import { logger } from "@server/utils/logger";
import type { Request, Response } from "express";

export function bearerTokenOr401(
  req: Request,
  res: Response,
): string | undefined {
  const token = requireSpotifyToken(req, res);
  return token ?? undefined;
}

export async function withBearerJson<T>(
  req: Request,
  res: Response,
  logLabel: string,
  clientError: string,
  work: (token: string) => Promise<T>,
): Promise<void> {
  const token = bearerTokenOr401(req, res);
  if (!token) return;
  try {
    const data = await work(token);
    res.json(data);
  } catch (error) {
    logger.error(logLabel, error);
    if (error instanceof HttpException) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: clientError });
  }
}
