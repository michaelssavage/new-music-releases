import type { SpotifyControllerI } from "@server/container/types";
import { SpotifyController } from "@server/controller/spotify.controller";
import express from "express";

export function SpotifyRouter({ spotifyService, env }: SpotifyControllerI) {
	const router = express.Router();
	const spotifyController = SpotifyController({ spotifyService, env });

	router.get("/login", spotifyController.loginHandler);
	router.get("/callback", spotifyController.callbackHandler);
	router.get("/refresh", spotifyController.refreshToken);
	router.get("/validate-token", spotifyController.validateTokenHandler);

	router.get("/user", spotifyController.getUser);

	router.get("/search", spotifyController.searchHandler);

	router.get("/saved-tracks", spotifyController.getSavedTracks);

	router.get("/spotify-artists", spotifyController.getSpotifyArtists);

	router.post("/save-artists", spotifyController.saveArtists);
	router.get("/get-artist/:id", spotifyController.getSingleArtist);
	router.get("/get-artists", spotifyController.getAllArtistsIds);

	router.delete("/remove-artist/:id", spotifyController.removeSavedArtist);

	router.get("/get-playlist", spotifyController.getSpotifyPlaylist);
	router.get("/update-playlist-releases", spotifyController.updateNewReleases);
	router.post("/save-song-to-playlist", spotifyController.saveSongToPlaylist);
	return router;
}
