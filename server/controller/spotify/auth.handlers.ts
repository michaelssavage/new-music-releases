import type { SpotifyControllerI } from "@server/container/types";
import { getAuthorizationUrl } from "@server/utils/auth";
import { logger } from "@server/utils/logger";
import type { Request, Response } from "express";

export function createAuthHandlers({
  spotifyService,
  api,
  env,
}: SpotifyControllerI) {
  function handleLogin(_req: Request, res: Response): void {
    const url = getAuthorizationUrl(
      `${env.SERVER_URL}/api/callback`,
      `${env.SPOTIFY_CLIENT_ID}`,
    );
    res.redirect(url);
  }

  async function handleOAuthCallback(
    req: Request,
    res: Response,
  ): Promise<void> {
    const code = req.query.code;

    try {
      const { userProfile, access_token, refresh_token, frontend_uri } =
        await spotifyService.completeOAuthLogin(code as string);

      res.redirect(
        `${frontend_uri}/callback?user_id=${userProfile.id}&access_token=${access_token}&refresh_token=${refresh_token}`,
      );
    } catch (error) {
      logger.error("Error during callback:", error);
      res.status(500).send("Authentication failed.");
    }
  }

  async function handleTokenRefresh(
    req: Request,
    res: Response,
  ): Promise<void> {
    const refresh_token = req.query.refresh_token as string;

    if (!refresh_token) {
      res.status(400).json({ error: "Missing refresh token" });
      return;
    }

    try {
      const response = await spotifyService.refreshAccessToken(refresh_token);
      const { access_token } = response.data;

      if (access_token) {
        res.json({ access_token });
      } else {
        res.status(500).json({ error: "Failed to refresh token" });
      }
    } catch (error) {
      logger.error("Error refreshing token:", error);
      res.status(500).send("Failed to refresh token.");
    }
  }

  async function handleValidateToken(
    req: Request,
    res: Response,
  ): Promise<void> {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json({ error: "Missing token" });
      return;
    }

    try {
      const status = await api.validateAccessToken(token);
      res.status(status).json({ status: status === 200 ? "OK" : "Invalid" });
    } catch (error) {
      logger.error("Error validating token:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  }

  return {
    handleLogin,
    handleOAuthCallback,
    handleTokenRefresh,
    handleValidateToken,
  };
}
