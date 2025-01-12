import { SpotifyService } from "server/services/spotify.sevice";

const spotifyService = SpotifyService();
const userId = "1";
const accessToken = "x";

(async () => {
	const newReleases = await spotifyService.fetchNewReleases(
		userId,
		accessToken,
	);
	console.log("New Releases:", newReleases);
})();
