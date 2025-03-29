import { logger } from "@client/utils/logger";
import type { SavedArtistI, SpotifyDataProps } from "@model/spotify";
import type { SaveSongRequestI } from "@model/spotify/playlist";
import type { Artist, SearchProps } from "@model/spotify/search";
import type { UserID } from "@model/spotify/user";
import axios from "axios";
import Cookies from "js-cookie";

export const isAuthValid = async (accessToken: string) => {
	const res = await axios.get("/api/validate-token", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	return res.data;
};

export async function refreshAuthToken(
	refreshToken: string,
): Promise<string | null> {
	try {
		const { data } = await axios.post("/api/refresh-token", {
			refresh_token: refreshToken,
		});
		const { access_token } = data;

		if (access_token) {
			Cookies.set("spotify_access_token", access_token, { expires: 1 }); // 1 day expiration
			return access_token;
		}
	} catch (error) {
		logger.error("Failed to refresh token:", error);
	}
	return null;
}

export const getUser = async (userId: UserID) => {
	try {
		const res = await axios.get(`/api/user?userId=${userId}`);
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to get user:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const saveArtist = async ({
	userId,
	data,
}: { userId: UserID; data: Artist }) => {
	try {
		logger.info(`Saving ${data.name}`, data);
		return await axios.post("/api/save-artists", {
			userId,
			artists: [data],
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to save artist:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
	}
};

export const removeArtist = async ({
	userId,
	name,
	id,
}: { userId: UserID; name: string; id: string }) => {
	try {
		logger.info(`Removing Artist ${name} with id ${id}`);
		await axios.delete(`/api/remove-artist/${id}?userId=${userId}`);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to remove artist:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const getArtist = async (id?: string) => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get<Artist>(`/api/get-artist/${id}`, {
			headers: { spotify_access_token },
		});
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to get artist:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const getSavedArtists = async (userId: UserID) => {
	const accessToken = Cookies.get("spotify_access_token");

	if (!accessToken) {
		return [];
	}

	try {
		const status = await isAuthValid(accessToken);
		if (status === "OK") {
			const res = await axios.get<Array<SavedArtistI>>(
				`/api/get-artists?userId=${userId}`,
			);
			return res.data;
		}
		logger.error("Failed to get saved artists: Invalid access token");
		return [];
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to get saved artists:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
		return [];
	}
};

export const getUserTracks = async () => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get("/api/saved-tracks", {
			headers: { spotify_access_token },
		});
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to get user tracks:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const getNextTracks = async (nextUrl: string) => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get(nextUrl, {
			headers: {
				Authorization: `Bearer ${spotify_access_token}`,
			},
		});

		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to get next tracks:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const fetchSearchResults = async ({
	search,
	type,
	limit = 10,
}: SearchProps) => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	const res = await axios.get("/api/search", {
		headers: { spotify_access_token },
		params: {
			q: search,
			type: type.join(","),
			limit: limit,
		},
	});
	return res.data;
};

export const getSpotifyPlaylist = async (userId: UserID) => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get<SpotifyDataProps>(
			`/api/get-playlist?userId=${userId}`,
			{
				headers: { spotify_access_token },
			},
		);
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to get playlist:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const updateSpotifyPlaylistReleases = async (userId: UserID) => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get(
			`/api/update-playlist-releases?userId=${userId}`,
			{
				headers: { spotify_access_token },
			},
		);
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to get spotify playlist releases:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const saveSongToPlaylist = async ({
	userId,
	trackId,
}: SaveSongRequestI) => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.post(
			"/api/save-song-to-playlist",
			{ userId, trackId },
			{
				headers: {
					spotify_access_token,
				},
			},
		);
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			logger.error(
				"Failed to save song to playlist:",
				error.response?.data || error.message,
			);
		} else {
			logger.error("An unexpected error occurred:", error);
		}
		return null;
	}
};
