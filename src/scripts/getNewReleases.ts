import spotifyService from "../server/service/spotify.sevice.ts";

(async () => {
	const accessToken = await spotifyService.getAccessToken();
	const newReleases = await spotifyService.fetchNewReleases(accessToken);
	console.log("New Releases:", newReleases);
})();
