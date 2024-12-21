import axios from "axios";
import type { SearchProps } from "src/types/spotify/search.ts";

export const fetchSearchResults = async ({
	search,
	type,
	limit = 10,
}: SearchProps) => {
	const { data } = await axios.get("http://localhost:5000/api/search", {
		params: {
			q: search,
			type: type.join(","),
			limit: limit,
		},
	});
	return data;
};
