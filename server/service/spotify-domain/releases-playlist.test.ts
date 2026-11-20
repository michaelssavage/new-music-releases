import type { PlaylistTracksI } from "@model/spotify/tracks";
import assert from "node:assert/strict";
import test from "node:test";
import {
  createReleasesPlaylistService,
  getLatestPlaylistAdditionDate,
} from "./releases-playlist";

test("playlist lookback uses the most recently added track date", () => {
  const items = [
    { added_at: "2026-07-29T21:00:00Z" },
    { added_at: "2026-08-01T08:30:00Z" },
    { added_at: "invalid" },
  ] as PlaylistTracksI["items"];

  assert.equal(getLatestPlaylistAdditionDate(items), "2026-08-01");
});

test("an empty playlist has no addition-date checkpoint", () => {
  assert.equal(getLatestPlaylistAdditionDate([]), undefined);
});

function setupSync(
  failingArtistIds: Array<string>,
  tracksAlreadyInPlaylist: Array<string> = [],
) {
  const appendedTrackUris: Array<string> = [];
  const checkpoints: Array<string> = [];

  const repository = {
    getAllArtists: async () => [
      { id: "ok-1" },
      { id: "ok-2" },
      ...failingArtistIds.map((id) => ({ id })),
    ],
    getPlaylist: async () => ({ id: "playlist", name: "Releases" }),
    getUser: async () => ({ userId: "user" }),
    setLastReleaseSyncAt: async (userId: string) => {
      checkpoints.push(userId);
    },
  };
  const api = {
    fetchPlaylistTracksAddedSince: async () => ({
      items: tracksAlreadyInPlaylist.map((uri) => ({ track: { uri } })),
    }),
    fetchArtistAlbums: async (_token: string, artistId: string) => {
      if (failingArtistIds.includes(artistId)) throw new Error("rate limited");
      return [
        { id: artistId, uri: `spotify:album:${artistId}`, name: artistId },
      ];
    },
    fetchAlbumTrackUris: async (_token: string, albumId: string) => [
      `spotify:track:${albumId}`,
    ],
    appendTracksToPlaylist: async (
      _token: string,
      _playlistId: string,
      uris: Array<string>,
    ) => {
      appendedTrackUris.push(...uris);
      return { data: { tracks: uris, snapshots: [] }, status: 201 };
    },
  };

  const service = createReleasesPlaylistService({
    repository: repository as never,
    api: api as never,
    ensureValidAccessToken: async () => "token",
  });

  return { service, appendedTrackUris, checkpoints };
}

test("artists that fail to fetch don't block the rest and hold the sync checkpoint back", async () => {
  const { service, appendedTrackUris, checkpoints } = setupSync(["broken"]);

  await assert.rejects(
    service.syncNewReleasesToUserPlaylist("user", "token", "2026-11-01"),
    /1 artists could not be fetched/,
  );

  assert.deepEqual(appendedTrackUris, [
    "spotify:track:ok-1",
    "spotify:track:ok-2",
  ]);
  assert.deepEqual(checkpoints, []);
});

test("releases whose tracks are already in the playlist aren't added again", async () => {
  const { service, appendedTrackUris } = setupSync([], ["spotify:track:ok-1"]);

  await service.syncNewReleasesToUserPlaylist("user", "token", "2026-11-01");

  assert.deepEqual(appendedTrackUris, ["spotify:track:ok-2"]);
});

test("a fully successful sync advances the checkpoint", async () => {
  const { service, checkpoints } = setupSync([]);

  await service.syncNewReleasesToUserPlaylist("user", "token", "2026-11-01");

  assert.deepEqual(checkpoints, ["user"]);
});
