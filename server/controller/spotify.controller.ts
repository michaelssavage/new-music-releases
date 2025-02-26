import type { Artist } from "@model/spotify/search";
import type { PlaylistTracksI } from "@model/spotify/tracks";
import type { SpotifyControllerI } from "@server/container/types";
import { getAuthorizationUrl } from "@server/utils/auth";
import type { Request, Response } from "express";

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
		userId: string;
	};
}

export function SpotifyController({ spotifyService, env }: SpotifyControllerI) {
	async function loginHandler(_req: Request, res: Response): Promise<void> {
		const url = getAuthorizationUrl(
			`${env.SERVER_URL}/api/callback`,
			`${env.SPOTIFY_CLIENT_ID}`,
		);
		res.redirect(url);
	}

	async function callbackHandler(req: Request, res: Response): Promise<void> {
		const code = req.query.code;

		try {
			const { userProfile, access_token, refresh_token, frontend_uri } =
				await spotifyService.callbackHandler(code as string);

			res.redirect(
				`${frontend_uri}/callback?user_id=${userProfile.id}&access_token=${access_token}&refresh_token=${refresh_token}`,
			);
		} catch (error) {
			console.error("Error during callback:", error);
			res.status(500).send("Authentication failed.");
		}
	}

	async function refreshToken(req: Request, res: Response): Promise<void> {
		const refresh_token = req.query.refresh_token as string;

		if (!refresh_token) {
			res.status(400).json({ error: "Missing refresh token" });
			return;
		}

		try {
			const response = await spotifyService.refreshToken(refresh_token);
			const { access_token } = response.data;

			if (access_token) {
				res.json({ access_token });
			} else {
				res.status(500).json({ error: "Failed to refresh token" });
			}
		} catch (error) {
			console.error("Error refreshing token:", error);
			res.status(500).send("Failed to refresh token.");
		}
	}

	async function validateToken(req: Request, res: Response): Promise<void> {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			res.status(400).json({ error: "Missing token" });
			return;
		}

		try {
			const response = await spotifyService.validateToken(token);
			if (response.status === 200) {
				res.sendStatus(200);
			} else {
				res.sendStatus(401);
			}
		} catch (error) {
			console.log("Error validating token:", error);
			res.status(401).json({ error: "Invalid token" });
		}
	}

	async function getUser(req: Request, res: Response): Promise<void> {
		const userId = req.query.userId as string;

		if (!userId) {
			res.status(400).json({ error: "No user id provided to save artists" });
			return;
		}

		try {
			const response = await spotifyService.getUser(userId);
			res.json(response);
		} catch (error) {
			console.error("Error saving artists:", error);
			res.status(500).json({ error: "Failed to save artists" });
		}
	}

	async function searchHandler(req: SearchQuery, res: Response): Promise<void> {
		const { q, type, limit } = req.query;
		const { spotify_access_token } = req.headers;

		if (!q || !type) {
			res.status(400).json({ error: "Missing required parameters" });
			return;
		}

		if (!spotify_access_token) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		try {
			const data = await spotifyService.searchItem(
				spotify_access_token as string,
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

	async function getSavedTracks(req: Request, res: Response): Promise<void> {
		const { spotify_access_token } = req.headers;

		if (!spotify_access_token) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		try {
			const tracks = await spotifyService.getSavedTracks(
				spotify_access_token as string,
			);
			res.json(tracks);
		} catch (error) {
			console.error("Error retrieving saved tracks:", error);
			res.status(500).json({ error: "Failed to retrieve saved tracks" });
		}
	}

	async function getSpotifyArtists(req: Request, res: Response): Promise<void> {
		const { spotify_access_token } = req.headers;

		if (!spotify_access_token) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		try {
			const artists = await spotifyService.getSpotifyArtists(
				spotify_access_token as string,
			);
			res.json(artists);
		} catch (error) {
			console.error("Error retrieving artists:", error);
			res.status(500).json({ error: "Failed to retrieve artists" });
		}
	}

	async function saveArtists(req: SaveQuery, res: Response): Promise<void> {
		const { artists, userId } = req.body;

		if (!artists || !artists.length || !Array.isArray(artists)) {
			res.status(400).json({ error: "Invalid artists data" });
			return;
		}

		if (!userId) {
			res.status(400).json({ error: "No user id provided to save artists" });
			return;
		}

		try {
			await spotifyService.saveArtists(userId, artists);
			res.status(201).json({ message: "Artists saved successfully" });
		} catch (error) {
			console.error("Error saving artists:", error);
			res.status(500).json({ error: "Failed to save artists" });
		}
	}

	async function getSingleArtist(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const { spotify_access_token } = req.headers;

		if (!id) {
			res.status(400).json({ error: "No artist id provided to get artist" });
			return;
		}

		if (!spotify_access_token) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		try {
			const artist = await spotifyService.getSingleArtist(
				spotify_access_token as string,
				id as string,
			);
			res.json(artist);
		} catch (error) {
			console.error("Error retrieving artist:", error);
			res.status(500).json({ error: "Failed to retrieve artist" });
		}
	}

	async function getAllArtistsIds(req: Request, res: Response): Promise<void> {
		const userId = req.query.userId as string;

		if (!userId) {
			res.status(400).json({ error: "No user id provided to get all artists" });
			return;
		}

		try {
			const artistIds = await spotifyService.getAllArtistsIds(userId);
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
		const userId = req.query.userId as string;

		if (!id) {
			res.status(400).json({ error: "No artist id provided to remove artist" });
			return;
		}

		if (!userId) {
			res.status(400).json({ error: "No user id provided to remove artists" });
			return;
		}

		try {
			await spotifyService.removeSavedArtist(userId, id);
			res.json({ message: "Artists removed successfully" });
		} catch (error) {
			console.error("Error removing artists:", error);
			res.status(500).json({ error: "Failed to remove artists" });
		}
	}

	async function getSpotifyPlaylist(
		req: Request,
		res: Response,
	): Promise<void> {
		const spotify_access_token = req.headers.spotify_access_token as string;
		const userId = req.query.userId as string;

		if (!spotify_access_token) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		if (!userId) {
			res.status(400).json({ error: "No user id provided to get playlist" });
			return;
		}

		try {
			const playlist = await spotifyService.getSpotifyPlaylist(
				userId,
				spotify_access_token,
			);

			if (!playlist) {
				res.status(404).json({ error: "No playlist found" });
				return;
			}

			const playlistItems = await spotifyService.getSpotifyPlaylistItems(
				spotify_access_token as string,
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

	async function updateNewReleases(req: Request, res: Response): Promise<void> {
		const spotify_access_token = req.headers.spotify_access_token as string;
		const userId = req.query.userId as string;

		if (!spotify_access_token) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		if (!userId) {
			res.status(400).json({ error: "No user id provided to get playlist" });
			return;
		}

		try {
			const data = spotifyService.updateNewReleases(
				userId,
				spotify_access_token,
			);
			res.json(data);
		} catch (error) {
			console.error("Error updating playlist releases:", error);
			res.status(500).json({ error: "Failed to update playlist releases" });
		}
	}

	return {
		loginHandler,
		callbackHandler,
		refreshToken,
		validateToken,
		getUser,
		searchHandler,
		getSavedTracks,
		getSpotifyArtists,
		saveArtists,
		getSingleArtist,
		getAllArtistsIds,
		removeSavedArtist,
		getSpotifyPlaylist,
		updateNewReleases,
	};
}
