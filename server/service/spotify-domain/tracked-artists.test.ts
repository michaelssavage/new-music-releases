import type { User } from "@model/spotify/user";
import assert from "node:assert/strict";
import test from "node:test";
import { createTrackedArtistsService } from "./tracked-artists";

test("the scheduled tracker sync uses each user's own playlist, skips users without one, and survives a failing user", async () => {
  const fetchedPlaylists: Array<string> = [];
  const savedFor: Array<string> = [];

  const users = [
    { userId: "has-playlist", trackerPlaylistId: "playlist-a" },
    { userId: "no-playlist" },
    { userId: "broken", trackerPlaylistId: "playlist-b" },
    { userId: "also-has-playlist", trackerPlaylistId: "playlist-c" },
  ] as Array<User>;

  const service = createTrackedArtistsService({
    repository: {
      getAllArtists: async () => [],
      getAllUsers: async () => users,
      saveArtists: async (userId: string) => {
        savedFor.push(userId);
      },
    } as never,
    api: {
      fetchPlaylistTracks: async (_token: string, playlistId: string) => {
        fetchedPlaylists.push(playlistId);
        if (playlistId === "playlist-b") throw new Error("playlist gone");
        return {
          items: [
            {
              track: {
                artists: [
                  { id: playlistId, name: playlistId, uri: playlistId },
                ],
              },
            },
          ],
        };
      },
    } as never,
    ensureValidAccessToken: async () => "token",
  });

  await service.syncTrackerPlaylistsForAllUsers();

  assert.deepEqual(fetchedPlaylists.sort(), [
    "playlist-a",
    "playlist-b",
    "playlist-c",
  ]);
  assert.deepEqual(savedFor.sort(), ["also-has-playlist", "has-playlist"]);
});

test("syncing a single user's tracker playlist needs one to be selected", async () => {
  const service = createTrackedArtistsService({
    repository: {} as never,
    api: {} as never,
    ensureValidAccessToken: async () => "token",
  });

  await assert.rejects(
    service.syncArtistsFromTrackerPlaylist({ userId: "me" } as User, "token"),
    { status: 409 },
  );
});

test("saving all followed artists only works while the user tracks nobody", async () => {
  const saved: Array<Array<string>> = [];
  const followed = [{ id: "a" }, { id: "b" }];

  const serviceFor = (alreadyTracked: number) =>
    createTrackedArtistsService({
      repository: {
        getAllArtists: async () => Array(alreadyTracked).fill({}),
        saveArtists: async (
          _userId: string,
          artists: Array<{ id: string }>,
        ) => {
          saved.push(artists.map(({ id }) => id));
        },
      } as never,
      api: { fetchFollowedArtists: async () => followed } as never,
      ensureValidAccessToken: async () => "token",
    });

  await assert.rejects(serviceFor(1).saveAllFollowedArtists("me", "token"), {
    status: 409,
  });
  assert.deepEqual(saved, []);

  assert.deepEqual(await serviceFor(0).saveAllFollowedArtists("me", "token"), {
    saved: 2,
  });
  assert.deepEqual(saved, [["a", "b"]]);
});
