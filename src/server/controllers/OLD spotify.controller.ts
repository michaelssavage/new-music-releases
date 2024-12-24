import type { Request, Response } from "express";
import type { ArtistI } from "src/types/spotify.ts";
import spotifyService from "../service/OLD spotify.sevice.ts";

interface SearchQuery extends Request {
	query: {
		q: string;
		type: string;
		limit?: string;
	};
}

const searchHandler = async (req: SearchQuery, res: Response) => {
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
};

interface SaveQuery extends Request {
	body: {
		artists: Array<ArtistI>;
	};
}

const saveArtists = async (req: SaveQuery, res: Response) => {
	const { artists } = req.body;

	if (!artists || !artists.length || !Array.isArray(artists)) {
		res.status(400).json({ error: "Invalid artists data" });
		return;
	}

	try {
		await spotifyService.addOrUpdateArtists(artists);
		res.status(201).json({ message: "Artists saved successfully" });
	} catch (error) {
		console.error("Error saving artists:", error);
		res.status(500).json({ error: "Failed to save artists" });
	}
};

const getSingleArtist = async (req: Request, res: Response) => {
	const { id } = req.query;

	if (!id) {
		res.status(400).json({ error: `Invalid artist id: ${id}` });
		return;
	}

	try {
		const artist = await spotifyService.getSingleArtist(id as string);
		res.json(artist);
	} catch (error) {
		console.error("Error retrieving artist:", error);
		res.status(500).json({ error: "Failed to retrieve artist" });
	}
};

const getSavedArtists = async (_req: Request, res: Response) => {
	try {
		const artistIds = await spotifyService.getSavedArtists();
		res.json(artistIds);
	} catch (error) {
		console.error("Error retrieving artists:", error);
		res.status(500).json({ error: "Failed to retrieve artists" });
	}
};

const removeSavedArtist = async (req: SaveQuery, res: Response) => {
	const { id } = req.params;

	if (!id) {
		res.status(400).json({ error: "Invalid artists data" });
		return;
	}

	try {
		await spotifyService.removeSavedArtist(id);
		res.json({ message: "Artists removed successfully" });
	} catch (error) {
		console.error("Error removing artists:", error);
		res.status(500).json({ error: "Failed to remove artists" });
	}
};

export default {
	searchHandler,
	saveArtists,
	getSingleArtist,
	getSavedArtists,
	removeSavedArtist,
};
