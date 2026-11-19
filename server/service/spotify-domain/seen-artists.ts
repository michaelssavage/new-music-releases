import type { SeenArtistsResponse } from "@model/seen-artists";
import type { SpotifyRepository } from "@server/repository/spotify.repository";
import { countByGenre, withPrimaryGenre } from "./genre-buckets";

type Repository = ReturnType<typeof SpotifyRepository>;

export function createSeenArtistsService(deps: { repository: Repository }) {
  const { repository } = deps;

  async function getSeenArtists(): Promise<SeenArtistsResponse> {
    const seenArtists = await repository.getSeenArtists();
    const artists = withPrimaryGenre(seenArtists);

    return { artists, genres: countByGenre(artists) };
  }

  return { getSeenArtists };
}
