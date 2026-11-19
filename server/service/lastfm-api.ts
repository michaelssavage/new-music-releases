import type { ArtistTagI } from "@model/seen-artists";
import { logger } from "@server/utils/logger";
import axios from "axios";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_ARTIST_NOT_FOUND = 6;
const TAGS_KEPT = 10;

interface TopTagsResponse {
  error?: number;
  message?: string;
  toptags?: { tag: Array<{ name: string; count: number }> };
}

export function createLastFmApi({ apiKey }: { apiKey: string }) {
  async function fetchTopTags(artistName: string): Promise<Array<ArtistTagI>> {
    const { data } = await axios.get<TopTagsResponse>(LASTFM_API_URL, {
      params: {
        method: "artist.getTopTags",
        artist: artistName,
        autocorrect: 1,
        api_key: apiKey,
        format: "json",
      },
    });

    if (data.error === LASTFM_ARTIST_NOT_FOUND) {
      logger.warn(`fetchTopTags:Last.fm has no artist named ${artistName}.`);
      return [];
    }
    if (data.error || !data.toptags) {
      throw new Error(`Last.fm error ${data.error}: ${data.message}`);
    }

    return data.toptags.tag
      .slice(0, TAGS_KEPT)
      .map(({ name, count }) => ({ name, count }));
  }

  return { fetchTopTags };
}

export type LastFmApi = ReturnType<typeof createLastFmApi>;
