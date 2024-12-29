import { SpotifyService } from "../server/services/spotify.sevice.ts";

const spotifyService = SpotifyService();

(async () => {
	const newReleases = await spotifyService.fetchNewReleases();
	console.log("New Releases:", newReleases);
})();
