import type { User } from "@model/spotify/user";
import assert from "node:assert/strict";
import test from "node:test";
import { createAccountsService } from "./accounts";

const profile = (id: string) => ({ id, display_name: id });
const account = (userId: string, extra: Partial<User> = {}) =>
  ({ userId, profile: profile(userId), ...extra }) as User;

function setup(users: Array<User>) {
  const verifications: Array<[string, boolean]> = [];
  const service = createAccountsService({
    repository: {
      getUser: async (userId: string) =>
        users.find((user) => user.userId === userId) ?? null,
      getAllUsers: async () => users,
      setVerified: async (userId: string, verified: boolean) => {
        verifications.push([userId, verified]);
      },
    } as never,
    api: {
      fetchCurrentUser: async (token: string) => profile(token),
    } as never,
  });
  return { service, verifications };
}

test("only verified accounts and admins pass the verified check", async () => {
  const { service } = setup([
    account("stranger"),
    account("friend", { verified: true }),
    account("owner", { roles: ["admin"] }),
  ]);

  const cases = [
    { token: "stranger", allowed: false },
    { token: "friend", allowed: true },
    { token: "owner", allowed: true },
  ];

  for (const { token, allowed } of cases) {
    const result = service.requireVerifiedUser(token);
    if (allowed) {
      assert.equal((await result).userId, token);
    } else {
      await assert.rejects(result, { status: 403 }, token);
    }
  }
});

test("verified accounts are not admins", async () => {
  const { service } = setup([
    account("friend", { verified: true }),
    account("owner", { roles: ["admin"] }),
  ]);

  await assert.rejects(service.requireAdmin("friend"), { status: 403 });
  assert.equal((await service.requireAdmin("owner")).userId, "owner");
});

test("a Spotify account that never logged in here is rejected", async () => {
  const { service } = setup([]);

  await assert.rejects(service.requireVerifiedUser("nobody"), { status: 401 });
});

test("scheduled syncs only see verified accounts", async () => {
  const { service } = setup([
    account("stranger"),
    account("friend", { verified: true }),
    account("revoked", { verified: false }),
    account("owner", { roles: ["admin"] }),
  ]);

  const users = await service.listVerifiedUsers();

  assert.deepEqual(
    users.map(({ userId }) => userId),
    ["friend", "owner"],
  );
});

test("verifying an account that doesn't exist is a 404", async () => {
  const { service, verifications } = setup([account("friend")]);

  await service.setAccountVerified("friend", true);
  await assert.rejects(service.setAccountVerified("ghost", true), {
    status: 404,
  });

  assert.deepEqual(verifications, [["friend", true]]);
});
