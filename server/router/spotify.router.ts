import type { SpotifyControllerI } from "@server/container/types";
import { SpotifyController } from "@server/controller/spotify.controller";
import express from "express";

export function SpotifyRouter({
  spotifyService,
  api,
  env,
}: SpotifyControllerI) {
  const router = express.Router();
  const c = SpotifyController({ spotifyService, api, env });

  router.get("/login", c.handleLogin);
  router.get("/callback", c.handleOAuthCallback);
  router.get("/refresh", c.handleTokenRefresh);
  router.get("/validate-token", c.handleValidateToken);

  router.get("/user", c.handleGetUser);

  router.get("/search", c.handleSearch);

  router.get("/saved-tracks", c.handleGetLikedTracks);

  router.get("/spotify-artists", c.handleListArtistsFromLikedTracks);

  router.post("/save-artists", c.handlePersistTrackedArtists);
  router.get("/get-artist/:id", c.handleGetArtistById);
  router.get("/get-artists", c.handleListSavedArtists);

  router.delete("/remove-artist/:id", c.handleRemoveTrackedArtist);

  router.get("/get-playlist", c.handleGetUserReleasesPlaylist);
  router.get("/get-playlist-tracks/:playlistId", c.handleGetPlaylistTracks);
  router.get("/update-playlist-releases", c.handleSyncPlaylistReleases);
  router.post("/save-song-to-playlist", c.handleAddTrackToPlaylist);

  router.post("/get-recommendations", c.handleGetRecommendations);
  return router;
}
