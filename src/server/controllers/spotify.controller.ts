import { SpotifyService } from "@server/services/spotify.sevice.ts";
import type { Request, Response } from "express";
import type { Artist } from "src/types/spotify/search.ts";
import type { PlaylistTracksI } from "src/types/spotify/tracks.ts";

interface SearchQuery extends Request {
	query: {
		q: string;
		type: string;
		limit?: string;
	};
}

interface SaveQuery extends Request {
	body: {
		artists: Array<Artist>;
	};
}

export function SpotifyController() {
	const spotifyService = SpotifyService();

	spotifyService.initialize().catch((err) => {
		console.error("Failed to initialize SpotifyService:", err);
	});

	async function searchHandler(req: SearchQuery, res: Response): Promise<void> {
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

	async function fetchAndSaveArtists(
		req: SaveQuery,
		res: Response,
	): Promise<void> {
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

	async function getSingleArtist(req: Request, res: Response): Promise<void> {
		const { id } = req.params;

		if (!id) {
			res.status(400).json({ error: "No artist id provided to get artist" });
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

	async function getAllArtistsIds(_req: Request, res: Response): Promise<void> {
		try {
			const artistIds = await spotifyService.getAllArtistsIds();
			res.json(artistIds);
		} catch (error) {
			console.error("Error retrieving artists:", error);
			res.status(500).json({ error: "Failed to retrieve artists" });
		}
	}

	async function removeSavedArtist(
		req: SaveQuery,
		res: Response,
	): Promise<void> {
		const { id } = req.params;

		if (!id) {
			res.status(400).json({ error: "No artist id provided to remove artist" });
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

	async function getSpotifyPlaylist(
		_req: Request,
		res: Response,
	): Promise<void> {
		try {
			const playlist = await spotifyService.getSpotifyPlaylist();

			if (!playlist) {
				res.status(404).json({ error: "No playlist found" });
				return;
			}

			const playlistItems = await spotifyService.getSpotifyPlaylistItems(
				playlist.id,
			);

			if (!playlistItems) {
				res.json({ playlist, playlistItems: {} as PlaylistTracksI });
				return;
			}

			res.json({ playlist, playlistItems });
		} catch (error) {
			console.error("Error retrieving playlist:", error);
			res.status(500).json({ error: "Failed to retrieve playlist" });
		}
	}

	async function updateSpotifyPlaylistReleases(
		_req: Request,
		res: Response,
	): Promise<void> {
		try {
			const playlist = await spotifyService.getSpotifyPlaylist();

			if (!playlist) {
				res.status(404).json({ error: "No playlist found" });
				return;
			}

			const data = await spotifyService.updateSpotifyPlaylistReleases(playlist);
			res.json(data);
		} catch (error) {
			console.error("Error updating playlist releases:", error);
			res.status(500).json({ error: "Failed to update playlist releases" });
		}
	}

	return {
		searchHandler,
		fetchAndSaveArtists,
		getSingleArtist,
		getAllArtistsIds,
		removeSavedArtist,
		getSpotifyPlaylist,
		updateSpotifyPlaylistReleases,
	};
}
