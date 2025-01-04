import { SpotifyService } from "server/services/spotify.sevice.ts";
import type { NewReleasesI } from "../types/spotify.ts";

const spotifyService = SpotifyService();
const accessToken = "x";

(async () => {
	const playlist = await spotifyService.getSpotifyPlaylist(accessToken);
	const newReleases: Array<NewReleasesI> =
		await spotifyService.fetchNewReleases(accessToken);

	const trackUris = (
		await Promise.all(
			newReleases.map(async ({ uri, id }) => {
				if (uri.includes("album")) {
					return await spotifyService.getAlbumTracks(accessToken, id);
				}
				return uri;
			}),
		)
	).flat();

	console.log(trackUris);
	if (playlist) {
		await spotifyService.addTracksToPlaylist(accessToken, playlist.id, trackUris);
	}
})();
