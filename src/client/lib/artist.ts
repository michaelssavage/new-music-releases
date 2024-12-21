import axios from "axios";
import type { ArtistI } from "src/types/spotify.ts";

export const saveArtist = async (data: ArtistI) => {
	try {
		console.log(`Saving ${data.name}`, data);
		await axios.post("http://localhost:5000/api/save-artists", {
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

export const removeArtist = async ({ name, id }: Omit<ArtistI, "uri">) => {
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
	}
};
