import { createAlbumsApi } from "./albums";
import { createCatalogApi } from "./catalog";
import { createLibraryApi } from "./library";
import { createMeApi } from "./me";
import { createPlaylistsApi } from "./playlists";

export function createSpotifyWebApi() {
  const me = createMeApi();
  const library = createLibraryApi();
  const catalog = createCatalogApi();
  const albums = createAlbumsApi();
  const playlists = createPlaylistsApi();

  return {
    ...me,
    ...library,
    ...catalog,
    ...albums,
    ...playlists,
  };
}

export type SpotifyWebApi = ReturnType<typeof createSpotifyWebApi>;
