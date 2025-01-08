import type { SearchResponse } from "@model/spotify/search";

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
