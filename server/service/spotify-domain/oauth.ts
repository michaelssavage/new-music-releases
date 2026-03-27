import { SPOTIFY_API_TOKEN } from "@server/utils/constants";
import { logger } from "@server/utils/logger";
import type { EnvVars } from "@server/utils/validateEnv";
import axios from "axios";

export function createSpotifyOAuth(env: EnvVars) {
  async function exchangeAuthorizationCode(code: string) {
    const { data } = await axios.post(
      SPOTIFY_API_TOKEN,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${env.SERVER_URL}/api/callback`,
        client_id: `${env.SPOTIFY_CLIENT_ID}`,
        client_secret: `${env.SPOTIFY_CLIENT_SECRET}`,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const { access_token, refresh_token } = data;
    logger.info("exchangeAuthorizationCode:Tokens fetched from Spotify.", {
      expires: data.expires_in,
      redirect_uri: `${env.SERVER_URL}/api/callback`,
    });

    return {
      access_token,
      refresh_token,
      frontend_uri: env.FRONTEND_URL,
    };
  }

  async function refreshAccessToken(refreshTokenValue: string) {
    return axios.post(
      SPOTIFY_API_TOKEN,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshTokenValue,
        client_id: env.SPOTIFY_CLIENT_ID as string,
        client_secret: env.SPOTIFY_CLIENT_SECRET as string,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );
  }

  return { exchangeAuthorizationCode, refreshAccessToken };
}
