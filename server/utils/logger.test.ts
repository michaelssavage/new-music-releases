import assert from "node:assert/strict";
import test from "node:test";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toLoggable } from "./logger";

test("toLoggable drops request credentials from Axios errors", () => {
  const config = {
    method: "get",
    url: "https://api.spotify.com/v1/me",
    headers: { Authorization: "Bearer secret-token" },
  } as InternalAxiosRequestConfig;
  const error = new AxiosError(
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

  const loggable = toLoggable(error);

  assert.deepEqual(loggable, {
    name: "AxiosError",
    message: "Request failed with status code 403",
    status: 403,
    method: "get",
    url: "https://api.spotify.com/v1/me",
    response: { error: { message: "User not registered" } },
  });
  assert.ok(!JSON.stringify(loggable).includes("secret-token"));
});
