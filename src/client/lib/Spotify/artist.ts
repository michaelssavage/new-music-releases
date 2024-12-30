import axios from "axios";
import Cookies from "js-cookie";
import type { Artist } from "src/types/spotify/search.ts";

export const saveArtist = async (data: Pick<Artist, "name" | "id" | "uri">) => {
	try {
		console.log(`Saving ${data.name}`, data);
		return await axios.post("http://localhost:5000/api/save-artists", {
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
		await axios.delete(`http://localhost:5000/api/remove-artist/${id}`);
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
		const res = await axios.get<Artist>(
			`http://localhost:5000/api/get-artist/${id}`,
			{
				headers: { spotify_access_token },
			},
		);
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
		const res = await axios.get<Array<Artist>>(
			"http://localhost:5000/api/get-artists",
		);
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
