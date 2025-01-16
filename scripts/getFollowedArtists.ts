import { logger } from "@client/utils/logger";
import { SpotifyService } from "@server/service/spotify.sevice";

const spotifyService = SpotifyService();
const accessToken = "x";

(async () => {
	const artists = await spotifyService.getFollowedArtists(accessToken);
	logger.info(
		"Followed artists:",
		artists.map(({ name }) => name),
	);
})();
