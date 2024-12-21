import type { SearchResponse } from "src/types/spotify/search.ts";

export const getActiveTabKey = ({
	artists,
	albums,
	tracks,
}: SearchResponse) => {
	return (
		Object.entries({ artists, albums, tracks }).find(
			([_, value]) => Array.isArray(value) && value.length > 0,
		)?.[0] || ""
	);
};
