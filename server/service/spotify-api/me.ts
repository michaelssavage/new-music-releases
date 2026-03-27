import type { SpotifyUserProfile } from "@model/spotify/user";
import { SPOTIFY_API_URL } from "@server/utils/constants";
import { getRequest } from "@server/utils/fetch";

export function createMeApi() {
  async function validateAccessToken(token: string) {
    const { status } = await getRequest(`${SPOTIFY_API_URL}/me`, token);
    return status;
  }

  async function fetchCurrentUser(accessToken: string) {
    const { data } = await getRequest<SpotifyUserProfile>(
      `${SPOTIFY_API_URL}/me`,
      accessToken,
    );

    return data;
  }

  return { validateAccessToken, fetchCurrentUser };
}
