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
  const fromTimestamp = fromDate ? new Date(fromDate).getTime() : undefined;
  const todayTimestamp = new Date(today).getTime();

  return items
    .filter(({ release_date }) => {
      if (!fromDate) return release_date === today;

      const releaseTimestamp = new Date(release_date).getTime();

      return (
        fromTimestamp !== undefined &&
        releaseTimestamp >= fromTimestamp &&
        releaseTimestamp <= todayTimestamp
      );
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
    let nextUrl: string | null =
      `${SPOTIFY_API_URL}/artists/${artistId}/albums`;
    let params: Record<string, unknown> | undefined = {
      include_groups: "single,album,appears_on",
      limit: 50,
    };
    const albums: Array<AlbumI> = [];

    while (nextUrl) {
      const { data } = await withSpotifyRetries(() =>
        getRequest<ArtistAlbumsI>(nextUrl as string, token, params),
      );
      albums.push(...data.items);
      const fromTimestamp = fromDate
        ? new Date(fromDate).getTime()
        : new Date(today).getTime();
      const pageIsBeforeWindow =
        data.items.length > 0 &&
        data.items.every(
          ({ release_date }) =>
            new Date(release_date).getTime() < fromTimestamp,
        );
      nextUrl = pageIsBeforeWindow ? null : data.next;
      params = undefined;
    }

    const filteredAlbums = filterAlbumsByReleaseWindow(albums, {
      fromDate,
      today,
    });

    logger.debug(`fetchArtistAlbums:Releases fetched for ${artistId}:`, {
      total: albums.length,
      filteredAlbumsToToday: filteredAlbums.length,
    });

    return filteredAlbums;
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
