import type { User } from "@model/spotify/user";
import assert from "node:assert/strict";
import test from "node:test";
import { createAccountsService } from "./accounts";

const profile = (id: string) => ({ id, display_name: id });
const account = (userId: string, extra: Partial<User> = {}) =>
  ({ userId, profile: profile(userId), ...extra }) as User;

function setup(users: Array<User>) {
  return createAccountsService({
    repository: {
      getUser: async (userId: string) =>
        users.find((user) => user.userId === userId) ?? null,
    } as never,
    api: {
      fetchCurrentUser: async (token: string) => profile(token),
    } as never,
  });
}

test("only admins pass the admin check", async () => {
  const service = setup([
    account("friend"),
    account("owner", { roles: ["admin"] }),
  ]);

  await assert.rejects(service.requireAdmin("friend"), { status: 403 });
  assert.equal((await service.requireAdmin("owner")).userId, "owner");
});

test("a Spotify account that never logged in here is rejected", async () => {
  const service = setup([]);

  await assert.rejects(service.requireUser("nobody"), { status: 401 });
});
