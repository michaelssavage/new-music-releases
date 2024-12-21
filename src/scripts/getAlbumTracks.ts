import spotifyService from "../server/service/spotify.sevice.ts";

(async () => {
	const albumId = "1C1Q5jK1Q8AHYJ2CzLqLME";
	const accessToken = await spotifyService.getAccessToken();
	const tracks = await spotifyService.getAlbumTracks(accessToken, albumId);
	console.log("All tracks:", tracks);
})();
