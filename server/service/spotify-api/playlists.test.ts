import assert from "node:assert/strict";
import test from "node:test";
import { newestFirstWindow } from "./playlists";

test("newest-first paging reads the playlist from its tail and stops at the start", () => {
  const cases = [
    { total: 70, offset: 0, expected: { start: 40, count: 30 } },
    { total: 70, offset: 30, expected: { start: 10, count: 30 } },
    { total: 70, offset: 60, expected: { start: 0, count: 10 } },
    { total: 70, offset: 70, expected: { start: 0, count: 0 } },
    { total: 0, offset: 0, expected: { start: 0, count: 0 } },
    { total: 30, offset: 0, expected: { start: 0, count: 30 } },
  ];

  for (const { total, offset, expected } of cases) {
    assert.deepEqual(
      newestFirstWindow(total, { offset, limit: 30 }),
      expected,
      `total ${total}, offset ${offset}`,
    );
  }
});
