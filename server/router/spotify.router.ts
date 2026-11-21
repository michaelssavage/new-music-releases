import type { SpotifyControllerI } from "@server/container/types";
import { createAccessMiddleware } from "@server/middleware/access.middleware";
import { SpotifyController } from "@server/controller/spotify.controller";
import express from "express";

export function SpotifyRouter({
  spotifyService,
  api,
  env,
}: SpotifyControllerI) {
  const router = express.Router();
  const c = SpotifyController({ spotifyService, api, env });
  const { requireUser } = createAccessMiddleware(spotifyService);

  router.get("/login", c.handleLogin);
  router.get("/callback", c.handleOAuthCallback);
  router.post("/refresh-token", c.handleTokenRefresh);
  router.get("/validate-token", c.handleValidateToken);

  router.get("/session", c.handleGetSession);

  router.get("/user", c.handleGetUser);

  router.get("/search", c.handleSearch);

  router.get("/saved-tracks", c.handleGetLikedTracks);

  router.get("/spotify-artists", c.handleListArtistsFromLikedTracks);

  router.get("/followed-artists", requireUser, c.handleListFollowedArtists);
  router.post(
    "/save-followed-artists",
    requireUser,
    c.handleSaveAllFollowedArtists,
  );

  router.post("/save-artists", c.handlePersistTrackedArtists);
  router.get("/get-artist/:id", c.handleGetArtistById);
  router.get("/get-artists", c.handleListSavedArtists);

  router.get("/seen-artists", requireUser, c.handleGetSeenArtists);
  router.post("/seen-artists", requireUser, c.handleAddSeenArtist);
  router.put("/seen-artists/:id", requireUser, c.handleUpdateSeenArtist);
  router.delete("/seen-artists/:id", requireUser, c.handleDeleteSeenArtist);

  router.delete("/remove-artist/:id", c.handleRemoveTrackedArtist);

  router.post(
    "/sync-tracker-playlist",
    requireUser,
    c.handleSyncArtistsFromTrackerPlaylist,
  );

  router.get("/get-playlist", requireUser, c.handleGetUserReleasesPlaylist);
  router.get("/get-playlist-tracks/:playlistId", c.handleGetPlaylistTracks);
  router.get(
    "/update-playlist-releases",
    requireUser,
    c.handleSyncPlaylistReleases,
  );

  router.get("/playlist-settings", requireUser, c.handleGetPlaylistSettings);
  router.get("/user-playlists", requireUser, c.handleGetUserPlaylists);
  router.put("/playlist-settings/:role", requireUser, c.handleSelectPlaylist);
  router.post("/playlist-settings/:role", requireUser, c.handleCreatePlaylist);
  router.patch("/playlist-settings/:role", requireUser, c.handleRenamePlaylist);
  router.post("/save-song-to-playlist", c.handleAddTrackToPlaylist);

  router.post("/get-recommendations", c.handleGetRecommendations);
  return router;
}
