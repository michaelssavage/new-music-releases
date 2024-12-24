import axios from "axios";
import type { Artist } from "src/types/spotify/search.ts";

export const getSavedArtists = async () => {
	const res = await axios.get<Array<Artist>>(
		"http://localhost:5000/api/get-artists",
	);
	return res.data;
};
