import axios from "axios";

export async function withSpotifyRetries<T>(
  operation: () => Promise<T>,
  options?: { maxRetries?: number },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];
          const waitTime =
            (retryAfter ? Number.parseInt(retryAfter, 10) : 1) * 1000;
          console.warn(`Rate limited. Retrying after ${waitTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else if (error.response && error.response.status >= 500) {
          console.warn(`Server error. Retrying attempt ${attempt + 1}...`);
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1)),
          );
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
    attempt++;
  }

  throw new Error(`Operation failed after ${maxRetries} attempts.`);
}
