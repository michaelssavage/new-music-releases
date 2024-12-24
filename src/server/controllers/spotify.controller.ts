import { SpotifyService } from "@server/service/spotify.sevice.ts";
import type { Request, Response } from "express";
import type { ArtistI } from "src/types/spotify.ts";

interface SearchQuery extends Request {
	query: {
		q: string;
		type: string;
		limit?: string;
	};
}

interface SaveQuery extends Request {
	body: {
		artists: Array<ArtistI>;
	};
}

export function SpotifyController() {
	const spotifyService = SpotifyService();

	spotifyService.initialize().catch((err) => {
		console.error("Failed to initialize SpotifyService:", err);
	});

	async function searchHandler(req: SearchQuery, res: Response) {
		const { q, type, limit } = req.query;

		if (!q || !type) {
			res.status(400).json({ error: "Missing required parameters" });
			return;
		}

		try {
			const data = await spotifyService.searchItem(
				q,
				type.split(","),
				Number(limit) || 10,
			);
			res.json(data);
		} catch (error) {
			console.error("Search error:", error);
			res.status(500).json({ error: "Failed to search" });
		}
	}

	async function fetchAndSaveArtists(req: SaveQuery, res: Response) {
		const { artists } = req.body;

		if (!artists || !artists.length || !Array.isArray(artists)) {
			res.status(400).json({ error: "Invalid artists data" });
			return;
		}

		try {
			await spotifyService.fetchAndSaveArtists(artists);
			res.status(201).json({ message: "Artists saved successfully" });
		} catch (error) {
			console.error("Error saving artists:", error);
			res.status(500).json({ error: "Failed to save artists" });
		}
	}

	async function getSingleArtist(req: Request, res: Response) {
		const { id } = req.params;

		if (!id) {
			res.status(400).json({ error: "No artist id provided" });
			return;
		}

		try {
			const artist = await spotifyService.getSingleArtist(id as string);
			res.json(artist);
		} catch (error) {
			console.error("Error retrieving artist:", error);
			res.status(500).json({ error: "Failed to retrieve artist" });
		}
	}

	async function getAllArtistsIds(_req: Request, res: Response) {
		try {
			const artistIds = await spotifyService.getAllArtistsIds();
			res.json(artistIds);
		} catch (error) {
			console.error("Error retrieving artists:", error);
			res.status(500).json({ error: "Failed to retrieve artists" });
		}
	}

	async function removeSavedArtist(req: SaveQuery, res: Response) {
		const { id } = req.params;

		if (!id) {
			res.status(400).json({ error: "No artist id provided" });
			return;
		}

		try {
			await spotifyService.removeSavedArtist(id);
			res.json({ message: "Artists removed successfully" });
		} catch (error) {
			console.error("Error removing artists:", error);
			res.status(500).json({ error: "Failed to remove artists" });
		}
	}

	return {
		searchHandler,
		fetchAndSaveArtists,
		getSingleArtist,
		getAllArtistsIds,
		removeSavedArtist,
	};
}
