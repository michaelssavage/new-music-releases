import { SpotifyController } from "@server/module/spotify/spotify.controller";
import express from "express";
import cron from "node-cron";

const router = express.Router();
const spotifyController = SpotifyController();

router.get("/login", spotifyController.loginHandler);
router.get("/callback", spotifyController.callbackHandler);
router.get("/refresh", spotifyController.refreshToken);
router.get("/validate-token", spotifyController.validateToken);

router.get("/user", spotifyController.getUser);

router.get("/search", spotifyController.searchHandler);

router.get("/saved-tracks", spotifyController.getSavedTracks);

router.post("/save-artists", spotifyController.saveArtists);
router.get("/get-artist/:id", spotifyController.getSingleArtist);
router.get("/get-artists", spotifyController.getAllArtistsIds);

router.delete("/remove-artist/:id", spotifyController.removeSavedArtist);

router.get("/get-playlist", spotifyController.getSpotifyPlaylist);
router.get("/update-playlist-releases", spotifyController.updateNewReleases);

router.get("/run-all-users", spotifyController.updatePlaylistsForAllUsers);

export default router;

cron.schedule("0 22 * * *", async () => {
	console.log("Starting daily playlist update...");
	await spotifyController.updatePlaylistsForAllUsers();
	console.log("Daily playlist update finished.");
});
