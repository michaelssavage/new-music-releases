import type { AccountI, SessionI } from "@model/accounts";
import type { User } from "@model/spotify/user";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import type { SpotifyWebApi } from "@server/service/spotify-api";
import { HttpException } from "@server/utils/exceptions";
import axios from "axios";

type Repository = ReturnType<typeof SpotifyRepository>;

export const isAdmin = (user: User) => user.roles?.includes("admin") ?? false;

export const isVerified = (user: User) =>
  user.verified === true || isAdmin(user);

const toAccount = (user: User): AccountI => ({
  userId: user.userId,
  displayName: user.profile.display_name || user.userId,
  verified: isVerified(user),
  isAdmin: isAdmin(user),
});

export function createAccountsService(deps: {
  repository: Repository;
  api: SpotifyWebApi;
}) {
  const { repository, api } = deps;

  async function authenticate(token: string): Promise<User> {
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

  async function requireVerifiedUser(token: string) {
    const user = await authenticate(token);
    if (!isVerified(user)) {
      throw new HttpException(403, "Your account hasn't been verified yet");
    }
    return user;
  }

  async function requireAdmin(token: string) {
    const user = await authenticate(token);
    if (!isAdmin(user)) throw new HttpException(403, "Admins only");
    return user;
  }

  async function getSession(token: string): Promise<SessionI> {
    const { userId, verified, isAdmin } = toAccount(await authenticate(token));
    return { userId, verified, isAdmin };
  }

  async function listAccounts(): Promise<Array<AccountI>> {
    const users = await repository.getAllUsers();
    return users
      .map(toAccount)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  async function setAccountVerified(userId: string, verified: boolean) {
    const user = await repository.getUser(userId);
    if (!user) throw new HttpException(404, "Account not found");
    await repository.setVerified(userId, verified);
  }

  async function listVerifiedUsers() {
    const users = await repository.getAllUsers();
    return users.filter(isVerified);
  }

  return {
    requireVerifiedUser,
    requireAdmin,
    getSession,
    listAccounts,
    setAccountVerified,
    listVerifiedUsers,
  };
}
