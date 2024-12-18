import axios from "axios";
import type { NewReleasesI } from "../types/spotify";
import { SPOTIFY_API_URL } from "../utils/constants";
import { getAccessToken } from "./getAccessToken";
import { getAlbumTracks } from "./getAlbumTracks";
import { fetchNewReleases } from "./getNewReleases";
import { getPlaylist } from "./getPlaylist";

const addTracksToPlaylist = async (
	tracks: string[],
	playlistId: string,
	accessToken: string,
) => {
	if (tracks?.length === 0) {
		console.log("No tracks to add.");
		return;
	}
	try {
		console.log("Adding tracks to playlist", { playlistId, tracks });

		const { data } = await axios.post(
			`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
			{ uris: tracks },
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			},
		);
		console.log(`Tracks added to playlist! Snapshot ID: ${data.snapshot_id}`);
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Error adding tracks:",
				error.response?.data || error.message,
			);
		} else if (error instanceof Error) {
			console.error("Unexpected error:", error.message);
		} else {
			console.error("Unknown error occurred");
		}
	}
};

(async () => {
	const accessToken = await getAccessToken();
	const playlist = await getPlaylist(accessToken);
	const newReleases: Array<NewReleasesI> = await fetchNewReleases(accessToken);

	const trackUris = (
		await Promise.all(
			newReleases.map(async ({ uri, id }) => {
				if (uri.includes("album")) {
					return await getAlbumTracks(id, accessToken);
				}
				return uri;
			}),
		)
	).flat();

	console.log(trackUris);
	await addTracksToPlaylist(trackUris, playlist.id, accessToken);
})();
