import axios from "axios";
import Cookies from "js-cookie";
import type { SearchProps } from "src/types/spotify/search.ts";

export const fetchSearchResults = async ({
	search,
	type,
	limit = 10,
}: SearchProps) => {
	const spotify_access_token = Cookies.get("spotify_access_token");

	const res = await axios.get("http://localhost:5000/api/search", {
		headers: { spotify_access_token },
		params: {
			q: search,
			type: type.join(","),
			limit: limit,
		},
	});
	return res.data;
};
