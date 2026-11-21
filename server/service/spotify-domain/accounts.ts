import type { SessionI } from "@model/accounts";
import type { User } from "@model/spotify/user";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import { HttpException } from "@server/utils/exceptions";
import axios from "axios";

type Repository = ReturnType<typeof SpotifyRepository>;

export const isAdmin = (user: User) => user.roles?.includes("admin") ?? false;

export function createAccountsService(deps: {
  repository: Repository;
  api: SpotifyWebApi;
}) {
  const { repository, api } = deps;

  async function requireUser(token: string): Promise<User> {
    const profile = await api.fetchCurrentUser(token).catch((error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new HttpException(401, "Invalid Spotify token");
      }
      throw error;
    });

    const user = await repository.getUser(profile.id);
    if (!user) throw new HttpException(401, "Unknown account, log in again");
    return user;
  }

  async function requireAdmin(token: string) {
    const user = await requireUser(token);
    if (!isAdmin(user)) throw new HttpException(403, "Admins only");
    return user;
  }

  async function getSession(token: string): Promise<SessionI> {
    const user = await requireUser(token);
    return { userId: user.userId, isAdmin: isAdmin(user) };
  }

  return { requireUser, requireAdmin, getSession };
}
