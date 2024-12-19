import axios from "axios";
import { SPOTIFY_API_URL } from "../utils/constants.ts";
import { getAccessToken } from "./getAccessToken.ts";

export const getAlbumTracks = async (albumId: string, accessToken: string) => {
	try {
		const { data } = await axios.get(
			`${SPOTIFY_API_URL}/albums/${albumId}/tracks`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);

		const tracks = data.items.map((track: { uri: string }) => track.uri);
		console.log("Album tracks returned:", tracks);
		return tracks;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Error fetching album tracks:",
				error.response?.data || error.message,
			);
		}
		return [];
	}
};

(async () => {
	const albumId = "1C1Q5jK1Q8AHYJ2CzLqLME";
	const accessToken = await getAccessToken();
	const tracks = await getAlbumTracks(albumId, accessToken);
	console.log("All tracks:", tracks);
})();
