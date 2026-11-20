import { logger } from "@server/utils/logger";
import axios from "axios";

const DEFAULT_MAX_ATTEMPTS = 6;
const DEFAULT_RETRY_AFTER_MS = 1000;
// A longer Retry-After means we are blocked, not throttled; waiting would stall the whole job.
const MAX_RETRY_AFTER_MS = 60_000;

function parseRetryAfterMs(retryAfter: unknown) {
  const seconds = Number.parseInt(String(retryAfter), 10);
  return Number.isNaN(seconds) ? DEFAULT_RETRY_AFTER_MS : seconds * 1000;
}

export function createSpotifyRetries(
  deps: {
    sleep?: (ms: number) => Promise<void>;
    now?: () => number;
  } = {},
) {
  const sleep =
    deps.sleep ??
    ((ms) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const now = deps.now ?? Date.now;

  // Spotify rate limits the whole app, so one 429 pauses every concurrent request.
  let pausedUntil = 0;

  return async function withSpotifyRetries<T>(
    operation: () => Promise<T>,
    options?: { maxAttempts?: number },
  ): Promise<T> {
    const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const pauseMs = pausedUntil - now();
      if (pauseMs > 0) await sleep(pauseMs);

      try {
        return await operation();
      } catch (error) {
        if (!axios.isAxiosError(error) || !error.response) throw error;

        const { status, headers } = error.response;

        if (status === 429) {
          const waitMs = parseRetryAfterMs(headers["retry-after"]);
          if (waitMs > MAX_RETRY_AFTER_MS) throw error;

          pausedUntil = Math.max(pausedUntil, now() + waitMs);
          logger.warn(
            `Rate limited. Pausing Spotify requests for ${waitMs}ms.`,
          );
        } else if (status >= 500) {
          logger.warn(`Server error. Retrying attempt ${attempt}...`);
          await sleep(1000 * attempt);
        } else {
          throw error;
        }
      }
    }

    throw new Error(`Operation failed after ${maxAttempts} attempts.`);
  };
}

export const withSpotifyRetries = createSpotifyRetries();
