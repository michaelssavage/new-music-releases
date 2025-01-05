import { SpotifyService } from "server/services/spotify.sevice";

const spotifyService = SpotifyService();
const accessToken = "x";

(async () => {
	const artists = await spotifyService.getFollowedArtists(accessToken);
	console.log(artists.map(({ name }) => name));
})();
