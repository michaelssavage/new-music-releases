import spotifyService from "../server/service/OLD spotify.sevice.ts";

(async () => {
	const accessToken = await spotifyService.getAccessToken();
	const playlist = await spotifyService.getSpotifyPlaylist(accessToken);
	console.log("My Spotify Playlist:", playlist);
})();
