import axios from "axios";
import Cookies from "js-cookie";
import type { SpotifyDataProps } from "src/types/spotify.ts";

export const getSpotifyPlaylist = async () => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get<SpotifyDataProps>(
			"http://localhost:5000/api/get-playlist",
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
		const res = await axios.get(
			"http://localhost:5000/api/update-playlist-releases",
			{
				headers: { spotify_access_token },
			},
		);
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
