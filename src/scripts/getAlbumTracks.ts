import { SpotifyService } from "server/services/spotify.sevice";

const spotifyService = SpotifyService();
const accessToken = "x";

(async () => {
	const albumId = "1C1Q5jK1Q8AHYJ2CzLqLME";
	const tracks = await spotifyService.getAlbumTracks(accessToken, albumId);
	console.log("All tracks:", tracks);
})();
