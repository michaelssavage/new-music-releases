import axios from "axios";
import type { Artist } from "src/types/spotify/search.ts";

export const saveArtist = async (data: Artist) => {
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

export const removeArtist = async ({ name, id }: Omit<Artist, "uri">) => {
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
	try {
		const res = await axios.get<Artist>(
			`http://localhost:5000/api/get-artist/${id}`,
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
