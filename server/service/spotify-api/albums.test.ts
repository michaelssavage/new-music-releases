import type { AlbumI } from "@model/spotify";
import assert from "node:assert/strict";
import test from "node:test";
import { filterAlbumsByReleaseWindow } from "./albums";

function album(id: string, releaseDate: string): AlbumI {
  return {
    id,
    name: id,
    release_date: releaseDate,
    uri: `spotify:album:${id}`,
    images: [{ url: "https://example.com/cover.jpg" }],
    external_urls: { spotify: "https://open.spotify.com" },
    artists: [],
  };
}

test("the daily filter only returns releases from today", () => {
  const result = filterAlbumsByReleaseWindow(
    [album("yesterday", "2026-08-25"), album("today", "2026-08-26")],
    { today: "2026-08-26" },
  );

  assert.deepEqual(
    result.map(({ id }) => id),
    ["today"],
  );
});

test("a backfill includes its start date through today and excludes future releases", () => {
  const result = filterAlbumsByReleaseWindow(
    [
      album("before", "2026-07-28"),
      album("start", "2026-07-29"),
      album("today", "2026-08-26"),
      album("future", "2026-08-27"),
    ],
    { fromDate: "2026-07-29", today: "2026-08-26" },
  );

  assert.deepEqual(
    result.map(({ id }) => id),
    ["start", "today"],
  );
});
