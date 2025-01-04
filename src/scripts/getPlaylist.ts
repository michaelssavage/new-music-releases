import { SpotifyService } from "../../server/services/spotify.sevice.ts";

const spotifyService = SpotifyService();

(async () => {
	const playlist = await spotifyService.getSpotifyPlaylist();
	console.log("My Spotify Playlist:", playlist);
})();
