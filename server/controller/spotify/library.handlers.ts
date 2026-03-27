import type { Artist } from "@model/spotify/liked-tracks";
import type { SpotifyControllerI } from "@server/container/types";
import { logger } from "@server/utils/logger";
import axios from "axios";
import type { Request, Response } from "express";
import { bearerTokenOr401, withBearerJson } from "./http-helpers";

interface SearchQuery extends Request {
  query: {
    q: string;
    type: string;
    limit?: string;
  };
}

interface PersistArtistsBody extends Request {
  body: {
    artists: Array<Artist>;
    userId: string;
  };
}

export function createLibraryHandlers({
  spotifyService,
  api,
}: SpotifyControllerI) {
  async function handleGetUser(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: "No user id provided" });
      return;
    }

    try {
      const response = await spotifyService.getUser(userId);
      res.json(response);
    } catch (error) {
      logger.error("Error loading user:", error);
      res.status(500).json({ error: "Failed to load user" });
    }
  }

  async function handleSearch(req: SearchQuery, res: Response): Promise<void> {
    const { q, type, limit } = req.query;

    if (!(q && type)) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    await withBearerJson(
      req,
      res,
      "Search error:",
      "Failed to search",
      (token) =>
        api.searchCatalog(token, q, type.split(","), Number(limit) || 10),
    );
  }

  async function handleGetLikedTracks(
    req: Request,
    res: Response,
  ): Promise<void> {
    await withBearerJson(
      req,
      res,
      "Error retrieving saved tracks:",
      "Failed to retrieve saved tracks",
      (token) => api.fetchLikedTracks(token),
    );
  }

  async function handleListArtistsFromLikedTracks(
    req: Request,
    res: Response,
  ): Promise<void> {
    await withBearerJson(
      req,
      res,
      "Error retrieving artists:",
      "Failed to retrieve artists",
      (token) => spotifyService.listUniqueArtistsFromLikedTracks(token),
    );
  }

  async function handlePersistTrackedArtists(
    req: PersistArtistsBody,
    res: Response,
  ): Promise<void> {
    const { artists, userId } = req.body;

    if (!(artists?.length && Array.isArray(artists))) {
      res.status(400).json({ error: "Invalid artists data" });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: "No user id provided to save artists" });
      return;
    }

    try {
      await spotifyService.persistTrackedArtists(userId, artists);
      res.status(201).json({ message: "Artists saved successfully" });
    } catch (error) {
      logger.error("Error saving artists:", error);
      res.status(500).json({ error: "Failed to save artists" });
    }
  }

  async function handleGetArtistById(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "No artist id provided to get artist" });
      return;
    }

    await withBearerJson(
      req,
      res,
      "Error retrieving artist:",
      "Failed to retrieve artist",
      (token) => api.fetchArtistById(token, id as string),
    );
  }

  async function handleListSavedArtists(
    req: Request,
    res: Response,
  ): Promise<void> {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: "No user id provided to get all artists" });
      return;
    }

    try {
      const savedArtists = await spotifyService.listSavedArtistsForUser(userId);
      res.json(savedArtists);
    } catch (error) {
      logger.error("Error retrieving artists:", error);
      res.status(500).json({ error: "Failed to retrieve artists" });
    }
  }

  async function handleRemoveTrackedArtist(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    const userId = req.query.userId as string;

    if (!id) {
      res.status(400).json({ error: "No artist id provided to remove artist" });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: "No user id provided to remove artists" });
      return;
    }

    try {
      await spotifyService.removeTrackedArtist(userId, id);
      res.json({ message: "Artists removed successfully" });
    } catch (error) {
      logger.error("Error removing artists:", error);
      res.status(500).json({ error: "Failed to remove artists" });
    }
  }

  async function handleGetRecommendations(
    req: Request,
    res: Response,
  ): Promise<void> {
    const token = bearerTokenOr401(req, res);
    if (!token) return;

    const { limit = 20, seed_artists } = req.body;

    try {
      const data = await api.fetchRecommendations(token, seed_artists, limit);
      res.json(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error("Error retrieving recommendations:", {
          status: error?.status,
          response: error?.response,
        });
      }
      res.status(500).json({
        error: "Failed to retrieve recommendations",
      });
    }
  }

  return {
    handleGetUser,
    handleSearch,
    handleGetLikedTracks,
    handleListArtistsFromLikedTracks,
    handlePersistTrackedArtists,
    handleGetArtistById,
    handleListSavedArtists,
    handleRemoveTrackedArtist,
    handleGetRecommendations,
  };
}
