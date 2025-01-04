import { SpotifyService } from "../../server/services/spotify.sevice.ts";
import type { NewReleasesI } from "../types/spotify.ts";

const spotifyService = SpotifyService();

(async () => {
	const playlist = await spotifyService.getSpotifyPlaylist();
	const newReleases: Array<NewReleasesI> =
		await spotifyService.fetchNewReleases();

	const trackUris = (
		await Promise.all(
			newReleases.map(async ({ uri, id }) => {
				if (uri.includes("album")) {
					return await spotifyService.getAlbumTracks(id);
				}
				return uri;
			}),
		)
	).flat();

	console.log(trackUris);
	if (playlist) {
		await spotifyService.addTracksToPlaylist(playlist.id, trackUris);
	}
})();
