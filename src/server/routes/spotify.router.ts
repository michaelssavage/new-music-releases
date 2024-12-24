import { SpotifyController } from "@server/controllers/spotify.controller.ts";
import express from "express";

const router = express.Router();
const spotifyController = SpotifyController();

router.get("/search", spotifyController.searchHandler);

router.post("/save-artists", spotifyController.fetchAndSaveArtists);
router.get("/get-artist/:id", spotifyController.getSingleArtist);
router.get("/get-artists", spotifyController.getAllArtistsIds);

router.delete("/remove-artist/:id", spotifyController.removeSavedArtist);

export default router;
