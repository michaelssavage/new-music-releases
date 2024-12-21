import express from "express";
import spotifyController from "../controllers/spotify.controller.ts";

const router = express.Router();

router.get("/search", spotifyController.searchHandler);

router.post("/save-artists", spotifyController.saveArtists);
router.get("/get-artists", spotifyController.getSavedArtists);
router.delete("/remove-artist/:id", spotifyController.removeSavedArtist);

export default router;
