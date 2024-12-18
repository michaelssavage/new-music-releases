import axios from "axios";
import type { NewReleasesI } from "../types/spotify";
import { getAccessToken } from "./getAccessToken";
import { fetchNewReleases } from "./getNewReleases";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

const addTracksToPlaylist = async (
	tracks: string[],
	playlistId: string,
	accessToken: string,
) => {
	await axios.post(
		`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
		{ uris: tracks },
		{ headers: { Authorization: `Bearer ${accessToken}` } },
	);

	console.log("Tracks added to playlist!");
};

(async () => {
	const PLAYLIST_ID = "your_playlist_id";
	const accessToken = await getAccessToken();
	const newReleases: Array<NewReleasesI> = await fetchNewReleases(accessToken);

	const trackUris = newReleases.map(({ uri }) => uri);
	if (trackUris.length > 0) {
		await addTracksToPlaylist(trackUris, PLAYLIST_ID, accessToken);
	} else {
		console.log("No new releases today.");
	}
})();
