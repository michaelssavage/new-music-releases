import type { SpotifyControllerI } from "@server/container/types";
import type { Request, Response } from "express";
import { withBearerJson } from "./http-helpers";

export function createAccountsHandlers({ spotifyService }: SpotifyControllerI) {
  async function handleGetSession(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error retrieving session:",
      "Failed to retrieve session",
      (token) => spotifyService.getSession(token),
    );
  }

  return { handleGetSession };
}
