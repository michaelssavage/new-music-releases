import type { User } from "@model/spotify/user";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import { logger } from "@server/utils/logger";
import type { createSpotifyOAuth } from "./oauth";

type OAuth = ReturnType<typeof createSpotifyOAuth>;
type Repository = ReturnType<typeof SpotifyRepository>;

export function createUserSession(deps: {
  repository: Repository;
  api: SpotifyWebApi;
  oauth: OAuth;
}) {
  const { repository, api, oauth } = deps;

  async function getUser(userId: string) {
    return repository.getUser(userId);
  }

  async function saveUser(user: User) {
    const result = await repository.saveUser(user);
    logger.debug("saveUser:User saved in MongoDB.", user);
    return result;
  }

  async function completeOAuthLogin(code: string) {
    const tokens = await oauth.exchangeAuthorizationCode(code);
    const userProfile = await api.fetchCurrentUser(tokens.access_token);

    const existing = await getUser(userProfile.id);
    if (!existing) {
      await saveUser({
        userId: userProfile.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        profile: userProfile,
        saved_artists: [],
      });
    }

    return {
      userProfile,
      ...tokens,
    };
  }

  async function ensureValidAccessToken(user: User) {
    try {
      await api.validateAccessToken(user.access_token);
      return user.access_token;
    } catch {
      const { data } = await oauth.refreshAccessToken(user.refresh_token);
      user.access_token = data.access_token;
      await saveUser(user);
      return data.access_token;
    }
  }

  return {
    getUser,
    saveUser,
    completeOAuthLogin,
    ensureValidAccessToken,
  };
}
