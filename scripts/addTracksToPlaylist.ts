import { SpotifyService } from "server/services/spotify.sevice";
import type { NewReleasesI } from "../model/spotify";

const spotifyService = SpotifyService();
const userId = "1";
const accessToken = "x";

(async () => {
	const playlist = await spotifyService.getSpotifyPlaylist(userId, accessToken);
	const newReleases: Array<NewReleasesI> =
		await spotifyService.fetchNewReleases(userId, accessToken);

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
		await spotifyService.addTracksToPlaylist(
			accessToken,
			playlist.id,
			trackUris,
		);
	}
})();
