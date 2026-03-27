import type { AlbumI, ArtistAlbumsI, NewReleasesI } from "@model/spotify";
import { SPOTIFY_API_URL } from "@server/utils/constants";
import { getRequest } from "@server/utils/fetch";
import { logger } from "@server/utils/logger";
import { withSpotifyRetries } from "./retry";

export function filterAlbumsByReleaseWindow(
  items: Array<AlbumI>,
  options: { fromDate?: string; today: string },
): Array<NewReleasesI> {
  const { fromDate, today } = options;

  return items
    .filter(({ release_date }) => {
      if (!fromDate) return release_date === today;

      const releaseTimestamp = new Date(release_date).getTime();
      const fromTimestamp = new Date(fromDate).getTime();

      return releaseTimestamp >= fromTimestamp;
    })
    .map((props) => ({
      id: props.id,
      uri: props.uri,
      artists: props.artists.map(({ name, id, external_urls }) => ({
        name,
        id,
        url: external_urls.spotify,
      })),
      name: props.name,
      image: props.images[0].url,
      url: props.external_urls.spotify,
    }));
}

interface AlbumTracksPage {
  items: Array<{ uri: string }>;
}

export function createAlbumsApi() {
  async function fetchArtistAlbums(
    token: string,
    artistId: string,
    fromDate?: string,
  ): Promise<Array<NewReleasesI>> {
    const today = new Date().toISOString().split("T")[0];

    return withSpotifyRetries(async () => {
      const { data } = await getRequest<ArtistAlbumsI>(
        `${SPOTIFY_API_URL}/artists/${artistId}/albums`,
        token,
        { include_groups: "single,album,appears_on", limit: 4 },
      );

      const filteredAlbums = filterAlbumsByReleaseWindow(data.items, {
        fromDate,
        today,
      });

      logger.debug(`fetchArtistAlbums:Releases fetched for ${artistId}:`, {
        total: data.total,
        filteredAlbumsToToday: filteredAlbums.length,
      });

      return filteredAlbums;
    });
  }

  async function fetchAlbumTrackUris(token: string, albumId: string) {
    const { data } = await getRequest<AlbumTracksPage>(
      `${SPOTIFY_API_URL}/albums/${albumId}/tracks`,
      token,
    );

    const tracks = data.items.map((track) => track.uri);
    logger.info("fetchAlbumTrackUris:Album tracks returned - ", tracks.length);
    return tracks;
  }

  return { fetchArtistAlbums, fetchAlbumTrackUris };
}
