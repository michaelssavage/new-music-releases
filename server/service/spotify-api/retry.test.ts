import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import assert from "node:assert/strict";
import test from "node:test";
import { createSpotifyRetries } from "./retry";

function rateLimitError(retryAfterSeconds: number) {
  const response = {
    status: 429,
    statusText: "Too Many Requests",
    headers: { "retry-after": String(retryAfterSeconds) },
    data: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse;
  return new AxiosError(
    "Too Many Requests",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    response,
  );
}

const nextTick = () => new Promise((resolve) => setImmediate(resolve));

test("a rate limit holds back requests that start while the pause is in effect", async () => {
  let clock = 0;
  const pendingSleeps: Array<() => void> = [];
  const retries = createSpotifyRetries({
    now: () => clock,
    sleep: () => new Promise((resolve) => pendingSleeps.push(resolve)),
  });
  const calls: Array<string> = [];

  const limited = retries(async () => {
    calls.push("limited");
    if (calls.length === 1) throw rateLimitError(3);
    return "limited";
  });
  await nextTick();
  const bystander = retries(async () => {
    calls.push("bystander");
    return "bystander";
  });
  await nextTick();

  assert.deepEqual(calls, ["limited"]);

  clock = 3000;
  for (const resume of pendingSleeps) resume();
  await Promise.all([limited, bystander]);

  assert.deepEqual(calls, ["limited", "limited", "bystander"]);
});

test("a Retry-After beyond a minute fails immediately instead of stalling the job", async () => {
  const retries = createSpotifyRetries({
    sleep: async () => assert.fail("must not wait out a long block"),
  });
  let calls = 0;

  await assert.rejects(
    retries(async () => {
      calls++;
      throw rateLimitError(3600);
    }),
    AxiosError,
  );
  assert.equal(calls, 1);
});
