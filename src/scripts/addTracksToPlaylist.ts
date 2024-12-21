import spotifyService from "../server/service/spotify.sevice.ts";
import type { NewReleasesI } from "../types/spotify.ts";

(async () => {
	const accessToken = await spotifyService.getAccessToken();
	const playlist = await spotifyService.getSpotifyPlaylist(accessToken);
	const newReleases: Array<NewReleasesI> =
		await spotifyService.fetchNewReleases(accessToken);

	const trackUris = (
		await Promise.all(
			newReleases.map(async ({ uri, id }) => {
				if (uri.includes("album")) {
					return await spotifyService.getAlbumTracks(id, accessToken);
				}
				return uri;
			}),
		)
	).flat();

	console.log(trackUris);
	await spotifyService.addTracksToPlaylist(accessToken, trackUris, playlist.id);
})();
