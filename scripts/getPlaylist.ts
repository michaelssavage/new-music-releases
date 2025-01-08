import { SpotifyService } from "server/services/spotify.sevice";

const spotifyService = SpotifyService();
const accessToken = "x";

(async () => {
	const playlist = await spotifyService.getSpotifyPlaylist(accessToken);
	console.log("My Spotify Playlist:", playlist);
})();
