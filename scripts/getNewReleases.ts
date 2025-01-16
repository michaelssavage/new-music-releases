import { logger } from "@client/utils/logger";
import { SpotifyService } from "@server/service/spotify.sevice";

const spotifyService = SpotifyService();
const userId = "1";
const accessToken = "x";

(async () => {
	const newReleases = await spotifyService.fetchNewReleases(
		userId,
		accessToken,
	);
	logger.info("New Releases:", newReleases);
})();
