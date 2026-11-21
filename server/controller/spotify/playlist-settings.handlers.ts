import {
  PLAYLIST_ROLES,
  type PlaylistRole,
  type PlaylistSettingsResponse,
  type UserPlaylistsResponse,
} from "@model/playlist-settings";
import type { SpotifyControllerI } from "@server/container/types";
import { HttpException } from "@server/utils/exceptions";
import type { Request, Response } from "express";
import { currentUser, withBearerJson } from "./http-helpers";

const MAX_PLAYLIST_NAME_LENGTH = 100;

function parseRole(req: Request): PlaylistRole {
  const { role } = req.params;
  if (!PLAYLIST_ROLES.includes(role as PlaylistRole)) {
    throw new HttpException(400, "Unknown playlist.");
  }
  return role as PlaylistRole;
}

function parsePlaylistName(body: unknown) {
  const { name } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim()) {
    throw new HttpException(400, "Playlist name is required.");
  }
  if (name.trim().length > MAX_PLAYLIST_NAME_LENGTH) {
    throw new HttpException(400, "Playlist name is too long.");
  }
  return name.trim();
}

function parsePlaylistId(body: unknown) {
  const { playlistId } = (body ?? {}) as Record<string, unknown>;
  if (typeof playlistId !== "string" || !playlistId) {
    throw new HttpException(400, "Playlist id is required.");
  }
  return playlistId;
}

export function createPlaylistSettingsHandlers({
  spotifyService,
}: SpotifyControllerI) {
  async function handleGetPlaylistSettings(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error retrieving playlist settings:",
      "Failed to retrieve playlist settings",
      (token): Promise<PlaylistSettingsResponse> =>
        spotifyService.getPlaylistSettings(currentUser(res), token),
    );
  }

  async function handleGetUserPlaylists(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error retrieving playlists:",
      "Failed to retrieve playlists",
      async (token): Promise<UserPlaylistsResponse> => ({
        playlists: await spotifyService.listOwnedPlaylists(
          currentUser(res),
          token,
        ),
      }),
    );
  }

  async function handleSelectPlaylist(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error selecting playlist:",
      "Failed to select playlist",
      async (token) => {
        await spotifyService.selectPlaylist(
          currentUser(res),
          token,
          parseRole(req),
          parsePlaylistId(req.body),
        );
        return { status: "OK" };
      },
    );
  }

  async function handleCreatePlaylist(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error creating playlist:",
      "Failed to create playlist",
      async (token) => {
        await spotifyService.createAndSelectPlaylist(
          currentUser(res),
          token,
          parseRole(req),
          parsePlaylistName(req.body),
        );
        return { status: "OK" };
      },
    );
  }

  async function handleRenamePlaylist(req: Request, res: Response) {
    await withBearerJson(
      req,
      res,
      "Error renaming playlist:",
      "Failed to rename playlist",
      async (token) => {
        await spotifyService.renamePlaylist(
          currentUser(res),
          token,
          parseRole(req),
          parsePlaylistName(req.body),
        );
        return { status: "OK" };
      },
    );
  }

  return {
    handleGetPlaylistSettings,
    handleGetUserPlaylists,
    handleSelectPlaylist,
    handleCreatePlaylist,
    handleRenamePlaylist,
  };
}
