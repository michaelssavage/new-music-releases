import { SpotifyService } from "server/services/spotify.sevice.ts";

const spotifyService = SpotifyService();
const accessToken = "x";

(async () => {
	const newReleases = await spotifyService.fetchNewReleases(accessToken);
	console.log("New Releases:", newReleases);
})();
