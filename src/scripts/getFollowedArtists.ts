import spotifyService from "../server/service/spotify.sevice.ts";

(async () => {
	const accessToken = await spotifyService.getAccessToken();
	const artists = await spotifyService.getFollowedArtists(accessToken);
	console.log(artists.map(({ name }) => name));
	// await spotifyService.overwriteArtists(artists);
})();
