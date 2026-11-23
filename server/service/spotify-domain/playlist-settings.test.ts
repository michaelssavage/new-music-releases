import type { User } from "@model/spotify/user";
import assert from "node:assert/strict";
import test from "node:test";
import { createPlaylistSettingsService } from "./playlist-settings";

const user = { userId: "me" } as User;

function setup() {
  const saved: Array<[string, string, string]> = [];
  const renamed: Array<[string, string]> = [];
  const coveredPlaylistIds: Array<string> = [];
  const playlists = {
    mine: { id: "mine", name: "Mine", owner: { id: "me" } },
    theirs: { id: "theirs", name: "Theirs", owner: { id: "someone-else" } },
  };

  const service = createPlaylistSettingsService({
    repository: {
      setPlaylistId: async (userId: string, role: string, id: string) => {
        saved.push([userId, role, id]);
      },
    } as never,
    api: {
      fetchPlaylist: async (_token: string, id: keyof typeof playlists) =>
        playlists[id],
      fetchUserPlaylists: async () => Object.values(playlists),
      createPlaylist: async (_token: string, { name }: { name: string }) => ({
        id: `new-${name}`,
      }),
      renamePlaylist: async (_token: string, id: string, name: string) => {
        renamed.push([id, name]);
      },
      uploadPlaylistCover: async (_token: string, id: string) => {
        coveredPlaylistIds.push(id);
      },
    } as never,
  });

  return { service, saved, renamed, coveredPlaylistIds };
}

test("only playlists the user owns can be selected or listed", async () => {
  const { service, saved } = setup();

  await assert.rejects(
    service.selectPlaylist(user, "token", "tracker", "theirs"),
    { status: 403 },
  );
  await service.selectPlaylist(user, "token", "tracker", "mine");

  assert.deepEqual(saved, [["me", "tracker", "mine"]]);
  assert.deepEqual(
    (await service.listOwnedPlaylists(user, "token")).map(({ id }) => id),
    ["mine"],
  );
});

test("each role gets its default playlist created once, and only Cookie Jar gets a cover", async () => {
  const { service, saved, coveredPlaylistIds } = setup();
  const withTracker = { ...user, trackerPlaylistId: "existing" } as User;

  assert.deepEqual(
    [
      await service.ensurePlaylistId(withTracker, "token", "tracker"),
      await service.ensurePlaylistId(user, "token", "releases"),
      await service.ensurePlaylistId(user, "token", "tracker"),
    ],
    ["existing", "new-Cookie Jar", "new-Artist Tracker"],
  );
  assert.deepEqual(saved, [
    ["me", "releases", "new-Cookie Jar"],
    ["me", "tracker", "new-Artist Tracker"],
  ]);
  assert.deepEqual(coveredPlaylistIds, ["new-Cookie Jar"]);
});

test("each role renames its own playlist, and nothing is renamed before one is selected", async () => {
  const { service, renamed } = setup();
  const configured = {
    ...user,
    releasesPlaylistId: "releases-id",
    trackerPlaylistId: "tracker-id",
  } as User;

  await assert.rejects(
    service.renamePlaylist(user, "token", "tracker", "New"),
    {
      status: 409,
    },
  );
  await service.renamePlaylist(configured, "token", "releases", "Daily");
  await service.renamePlaylist(configured, "token", "tracker", "Watchlist");

  assert.deepEqual(renamed, [
    ["releases-id", "Daily"],
    ["tracker-id", "Watchlist"],
  ]);
});
