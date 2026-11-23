import assert from "node:assert/strict";
import test from "node:test";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toLoggable } from "./logger";

const config = {
  method: "get",
  url: "https://api.spotify.com/v1/me",
  headers: { Authorization: "Bearer secret-token" },
} as InternalAxiosRequestConfig;

function forbiddenError() {
  return new AxiosError(
    "Request failed with status code 403",
    "ERR_BAD_REQUEST",
    config,
    {},
    {
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config,
      data: { error: { message: "User not registered" } },
    },
  );
}

const loggableForbidden = {
  name: "AxiosError",
  message: "Request failed with status code 403",
  status: 403,
  method: "get",
  url: "https://api.spotify.com/v1/me",
  response: { error: { message: "User not registered" } },
};

test("toLoggable drops request credentials from Axios errors", () => {
  const loggable = toLoggable(forbiddenError());

  assert.deepEqual(loggable, loggableForbidden);
  assert.ok(!JSON.stringify(loggable).includes("secret-token"));
});

test("toLoggable unwraps aggregated errors so they don't serialise to {}", () => {
  const error = new AggregateError(
    [forbiddenError(), new Error("checkpoint not advanced")],
    "Failed to update playlists for 2 users",
  );

  const loggable = toLoggable(error);

  assert.deepEqual(loggable, {
    name: "AggregateError",
    message: "Failed to update playlists for 2 users",
    errors: [
      loggableForbidden,
      { name: "Error", message: "checkpoint not advanced" },
    ],
  });
  assert.ok(!JSON.stringify(loggable).includes("secret-token"));
});
