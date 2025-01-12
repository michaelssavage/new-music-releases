import { logger } from "@client/utils/logger";
import { SpotifyService } from "@server/module/spotify/spotify.sevice";

const spotifyService = SpotifyService();
const userId = "1";
const accessToken = "x";

(async () => {
	const playlist = await spotifyService.getSpotifyPlaylist(userId, accessToken);
	logger.info("My Spotify Playlist:", playlist);
})();
