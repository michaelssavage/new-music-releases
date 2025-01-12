import { logger } from "@client/utils/logger";
import { SpotifyService } from "@server/module/spotify/spotify.sevice";

const spotifyService = SpotifyService();
const accessToken = "x";

(async () => {
	const albumId = "1C1Q5jK1Q8AHYJ2CzLqLME";
	const tracks = await spotifyService.getAlbumTracks(accessToken, albumId);
	logger.info("All tracks:", tracks);
})();
