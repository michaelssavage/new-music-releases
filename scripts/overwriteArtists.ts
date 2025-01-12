import { SpotifyService } from "@server/module/spotify/spotify.sevice";

const spotifyService = SpotifyService();
const userId = "1";
const accessToken = "x";

(async () => {
	const artists = await spotifyService.getFollowedArtists(accessToken);
	await spotifyService.resetArtists(userId, artists);
})();
