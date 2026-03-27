import type { SpotifyControllerI } from "@server/container/types";
import { createAuthHandlers } from "./spotify/auth.handlers";
import { createLibraryHandlers } from "./spotify/library.handlers";
import { createPlaylistHandlers } from "./spotify/playlist.handlers";

export function SpotifyController(deps: SpotifyControllerI) {
  return {
    ...createAuthHandlers(deps),
    ...createLibraryHandlers(deps),
    ...createPlaylistHandlers(deps),
  };
}
