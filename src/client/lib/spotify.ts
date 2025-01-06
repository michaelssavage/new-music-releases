import axios from "axios";
import Cookies from "js-cookie";
import type { SpotifyDataProps } from "types/spotify";
import type { SearchProps } from "types/spotify/search";
import type { Artist } from "types/spotify/search";

const BASE_URL = import.meta.env.SERVER_URL || "http://localhost:5000";

// Auth
export const isAuthValid = async (accessToken: string) => {
	const res = await axios.get(`${BASE_URL}/api/validate-token`, {
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
		const { data } = await axios.post(`${BASE_URL}/api/refresh-token`, {
			refresh_token: refreshToken,
		});
		const { access_token } = data;

		if (access_token) {
			Cookies.set("spotify_access_token", access_token, { expires: 1 }); // 1 day expiration
			return access_token;
		}
	} catch (error) {
		console.error("Failed to refresh token:", error);
	}
	return null;
}

// Artist

export const saveArtist = async (data: Pick<Artist, "name" | "id" | "uri">) => {
	try {
		console.log(`Saving ${data.name}`, data);
		return await axios.post(`${BASE_URL}/api/save-artists`, {
			artists: [data],
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Failed to save artist:",
				error.response?.data || error.message,
			);
		} else {
			console.error("An unexpected error occurred:", error);
		}
	}
};

export const removeArtist = async ({
	name,
	id,
}: Pick<Artist, "name" | "id">) => {
	try {
		console.log(`Removing Artist ${name} with id ${id}`);
		await axios.delete(`${BASE_URL}/api/remove-artist/${id}`);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Failed to remove artist:",
				error.response?.data || error.message,
			);
		} else {
			console.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const getArtist = async (id?: string) => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get<Artist>(`${BASE_URL}/api/get-artist/${id}`, {
			headers: { spotify_access_token },
		});
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Failed to get artist:",
				error.response?.data || error.message,
			);
		} else {
			console.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const getSavedArtists = async () => {
	try {
		const res = await axios.get<Array<Artist>>(`${BASE_URL}/api/get-artists`);
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Failed to get saved artists:",
				error.response?.data || error.message,
			);
		} else {
			console.error("An unexpected error occurred:", error);
		}
		return [];
	}
};

// tracks

export const getUserTracks = async () => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get(`${BASE_URL}/api/saved-tracks`, {
			headers: { spotify_access_token },
		});
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Failed to get user tracks:",
				error.response?.data || error.message,
			);
		} else {
			console.error("An unexpected error occurred:", error);
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
			console.error(
				"Failed to get next tracks:",
				error.response?.data || error.message,
			);
		} else {
			console.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

// Search

export const fetchSearchResults = async ({
	search,
	type,
	limit = 10,
}: SearchProps) => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	const res = await axios.get(`${BASE_URL}/api/search`, {
		headers: { spotify_access_token },
		params: {
			q: search,
			type: type.join(","),
			limit: limit,
		},
	});
	return res.data;
};

// Playlist

export const getSpotifyPlaylist = async () => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get<SpotifyDataProps>(
			`${BASE_URL}/api/get-playlist`,
			{
				headers: { spotify_access_token },
			},
		);
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Failed to get playlist:",
				error.response?.data || error.message,
			);
		} else {
			console.error("An unexpected error occurred:", error);
		}
		return null;
	}
};

export const updateSpotifyPlaylistReleases = async () => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get(`${BASE_URL}/api/update-playlist-releases`, {
			headers: { spotify_access_token },
		});
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Failed to get spotify playlist releases:",
				error.response?.data || error.message,
			);
		} else {
			console.error("An unexpected error occurred:", error);
		}
		return null;
	}
};
