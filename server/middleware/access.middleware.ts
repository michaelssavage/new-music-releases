import type { User } from "@model/spotify/user";
import type { SpotifyService } from "@server/service/spotify.service";
import { requireSpotifyToken } from "@server/utils/auth";
import { HttpException } from "@server/utils/exceptions";
import { logger } from "@server/utils/logger";
import type { RequestHandler } from "express";

type Authorize = (token: string) => Promise<User>;

function guard(authorize: Authorize): RequestHandler {
  return async (req, res, next) => {
    const token = requireSpotifyToken(req, res);
    if (!token) return;

    try {
      res.locals.user = await authorize(token);
      next();
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      logger.error("Access check failed:", error);
      res.status(500).json({ error: "Failed to check account access" });
    }
  };
}

export function createAccessMiddleware(
  spotifyService: ReturnType<typeof SpotifyService>,
) {
  return {
    requireUser: guard(spotifyService.requireUser),
    requireAdmin: guard(spotifyService.requireAdmin),
  };
}
