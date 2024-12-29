import { SpotifyService } from "../server/services/spotify.sevice.ts";

const spotifyService = SpotifyService();

(async () => {
	const artists = await spotifyService.getFollowedArtists();
	console.log(artists.map(({ name }) => name));
})();
