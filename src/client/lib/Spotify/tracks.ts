import axios from "axios";
import Cookies from "js-cookie";

export const getUserTracks = async () => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	try {
		const res = await axios.get("http://localhost:5000/api/saved-tracks", {
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
