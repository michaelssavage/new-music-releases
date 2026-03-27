import type { FollowedArtistsI } from "@model/spotify";
import type { Artist, LikedTracksI } from "@model/spotify/liked-tracks";
import { SPOTIFY_API_URL } from "@server/utils/constants";
import { getRequest } from "@server/utils/fetch";
import { logger } from "@server/utils/logger";
import createHttpError from "http-errors";

export function createLibraryApi() {
  async function fetchLikedTracks(token: string) {
    const { data } = await getRequest<LikedTracksI>(
      `${SPOTIFY_API_URL}/me/tracks`,
      token,
    );
    if (!data) {
      throw createHttpError(404, "No saved tracks found.");
    }

    logger.info(
      "fetchLikedTracks:Saved tracks fetched from Spotify.",
      data.total,
    );
    return data;
  }

  async function fetchFollowedArtists(token: string): Promise<Array<Artist>> {
    let artists: Array<Artist> = [];

    let nextUrl: string | null =
      `${SPOTIFY_API_URL}/me/following?type=artist&limit=50`;

    while (nextUrl) {
      const res: { data: FollowedArtistsI } =
        await getRequest<FollowedArtistsI>(nextUrl, token);
      artists = artists.concat(res?.data.artists.items);
      nextUrl = res?.data.artists.next;
    }

    logger.info(
      `fetchFollowedArtists:${artists.length} followed artists fetched from spotify.`,
    );
    return artists;
  }

  return { fetchLikedTracks, fetchFollowedArtists };
}
