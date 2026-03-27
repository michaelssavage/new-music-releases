import type { SpotifyControllerI } from "@server/container/types";
import { logger } from "@server/utils/logger";
import type { Request, Response } from "express";
import { bearerTokenOr401, withBearerJson } from "./http-helpers";

export function createPlaylistHandlers({
  spotifyService,
  api,
}: SpotifyControllerI) {
  async function handleGetPlaylistTracks(
    req: Request,
    res: Response,
  ): Promise<void> {
    const token = bearerTokenOr401(req, res);
    if (!token) return;

    const playlistId = req.params.playlistId as string;
    if (!playlistId) {
      res.status(400).json({ error: "No playlist id provided to get tracks" });
      return;
    }
    try {
      const playlistItems = await api.fetchPlaylistTracks(token, playlistId);
      res.json(playlistItems);
    } catch (error) {
      logger.error("Error retrieving playlist tracks:", error);
      res.status(500).json({ error: "Failed to retrieve playlist tracks" });
    }
  }

  async function handleGetUserReleasesPlaylist(
    req: Request,
    res: Response,
  ): Promise<void> {
    const token = bearerTokenOr401(req, res);
    if (!token) return;

    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: "No user id provided to get playlist" });
      return;
    }

    try {
      const result = await spotifyService.getUserReleasesPlaylistWithTracks(
        userId,
        token,
      );

      if (!result) {
        res.status(404).json({ error: "No playlist found" });
        return;
      }

      res.json(result);
    } catch (error) {
      logger.error("Error retrieving playlist:", error);
      res.status(500).json({ error: "Failed to retrieve playlist" });
    }
  }

  async function handleSyncPlaylistReleases(
    req: Request,
    res: Response,
  ): Promise<void> {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: "No user id provided to get playlist" });
      return;
    }

    await withBearerJson(
      req,
      res,
      "Error updating playlist releases:",
      "Failed to update playlist releases",
      (token) => spotifyService.syncNewReleasesToUserPlaylist(userId, token),
    );
  }

  async function handleAddTrackToPlaylist(
    req: Request,
    res: Response,
  ): Promise<void> {
    const token = bearerTokenOr401(req, res);
    if (!token) return;

    const { userId, trackId, playlistId } = req.body;

    if (!(userId && trackId)) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const user = await spotifyService.getUser(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    try {
      const data = await api.addTrackToPlaylistById({
        spotifyAccessToken: token,
        trackId,
        playlistId,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error adding track to playlist:", error);
      res.status(500).json({ error: "Failed to add track to playlist" });
    }
  }

  return {
    handleGetPlaylistTracks,
    handleGetUserReleasesPlaylist,
    handleSyncPlaylistReleases,
    handleAddTrackToPlaylist,
  };
}
