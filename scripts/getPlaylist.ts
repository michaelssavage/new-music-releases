import { SpotifyService } from "server/services/spotify.sevice";

const spotifyService = SpotifyService();
const userId = "1";
const accessToken = "x";

(async () => {
	const playlist = await spotifyService.getSpotifyPlaylist(userId, accessToken);
	console.log("My Spotify Playlist:", playlist);
})();
