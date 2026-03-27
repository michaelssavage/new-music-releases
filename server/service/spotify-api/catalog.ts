import type { Artist } from "@model/spotify/liked-tracks";
import type { SearchResponse } from "@model/spotify/search";
import { SPOTIFY_API_URL } from "@server/utils/constants";
import { getRequest } from "@server/utils/fetch";
import { logger } from "@server/utils/logger";
import createHttpError from "http-errors";

export function createCatalogApi() {
  async function fetchRecommendations(
    token: string,
    seedArtists: Array<string>,
    limit: number,
  ) {
    const stringifiedArtists = seedArtists.join(",");

    const data = await getRequest(
      `${SPOTIFY_API_URL}/recommendations?seed_artists=${stringifiedArtists}&limit=${limit}`,
      token,
    );

    if (!data) {
      throw createHttpError(404, "No recommendations found.");
    }

    return data;
  }

  async function searchCatalog(
    token: string,
    query: string,
    type: Array<string>,
    limit: number,
  ): Promise<SearchResponse> {
    const { data } = await getRequest<SearchResponse>(
      `${SPOTIFY_API_URL}/search?q=${query}&type=${type.join(",")}&limit=${limit}`,
      token,
    );
    if (!data) {
      throw createHttpError(404, "No data found.");
    }

    return data;
  }

  async function fetchArtistById(token: string, id: string) {
    const { data } = await getRequest<Artist>(
      `${SPOTIFY_API_URL}/artists/${id}`,
      token,
    );

    if (!data) {
      throw createHttpError(404, "No artist found.");
    }

    logger.info("fetchArtistById:Single artist fetched from spotify.", {
      id: data.id,
      name: data.name,
    });
    return data;
  }

  return { fetchRecommendations, searchCatalog, fetchArtistById };
}
