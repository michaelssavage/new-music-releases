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
  const { requireVerified, requireAdmin } =
    createAccessMiddleware(spotifyService);

  router.get("/login", c.handleLogin);
  router.get("/callback", c.handleOAuthCallback);
  router.post("/refresh-token", c.handleTokenRefresh);
  router.get("/validate-token", c.handleValidateToken);

  router.get("/session", c.handleGetSession);
  router.get("/accounts", requireAdmin, c.handleGetAccounts);
  router.put(
    "/accounts/:userId/verification",
    requireAdmin,
    c.handleSetAccountVerification,
  );

  router.get("/user", c.handleGetUser);

  router.get("/search", c.handleSearch);

  router.get("/saved-tracks", c.handleGetLikedTracks);

  router.get("/spotify-artists", c.handleListArtistsFromLikedTracks);

  router.post("/save-artists", c.handlePersistTrackedArtists);
  router.get("/get-artist/:id", c.handleGetArtistById);
  router.get("/get-artists", c.handleListSavedArtists);

  router.get("/seen-artists", c.handleGetSeenArtists);
  router.post("/seen-artists", c.handleAddSeenArtist);
  router.put("/seen-artists/:id", c.handleUpdateSeenArtist);
  router.delete("/seen-artists/:id", c.handleDeleteSeenArtist);

  router.delete("/remove-artist/:id", c.handleRemoveTrackedArtist);

  router.post(
    "/sync-tracker-playlist",
    requireVerified,
    c.handleSyncArtistsFromTrackerPlaylist,
  );

  router.get("/get-playlist", requireVerified, c.handleGetUserReleasesPlaylist);
  router.get("/get-playlist-tracks/:playlistId", c.handleGetPlaylistTracks);
  router.get(
    "/update-playlist-releases",
    requireVerified,
    c.handleSyncPlaylistReleases,
  );

  router.get(
    "/playlist-settings",
    requireVerified,
    c.handleGetPlaylistSettings,
  );
  router.get("/user-playlists", requireVerified, c.handleGetUserPlaylists);
  router.put(
    "/playlist-settings/:role",
    requireVerified,
    c.handleSelectPlaylist,
  );
  router.post(
    "/playlist-settings/:role",
    requireVerified,
    c.handleCreatePlaylist,
  );
  router.patch(
    "/playlist-settings/:role",
    requireVerified,
    c.handleRenamePlaylist,
  );
  router.post("/save-song-to-playlist", c.handleAddTrackToPlaylist);

  router.post("/get-recommendations", c.handleGetRecommendations);
  return router;
}
