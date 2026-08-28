import type { PlaylistTracksI } from "@model/spotify/tracks";
import assert from "node:assert/strict";
import test from "node:test";
import { getLatestPlaylistAdditionDate } from "./releases-playlist";

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
