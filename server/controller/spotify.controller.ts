import type { SpotifyControllerI } from "@server/container/types";
import { createAccountsHandlers } from "./spotify/accounts.handlers";
import { createAuthHandlers } from "./spotify/auth.handlers";
import { createLibraryHandlers } from "./spotify/library.handlers";
import { createPlaylistHandlers } from "./spotify/playlist.handlers";
import { createPlaylistSettingsHandlers } from "./spotify/playlist-settings.handlers";
import { createSeenArtistsHandlers } from "./spotify/seen-artists.handlers";

export function SpotifyController(deps: SpotifyControllerI) {
  return {
    ...createAuthHandlers(deps),
    ...createAccountsHandlers(deps),
    ...createLibraryHandlers(deps),
    ...createPlaylistHandlers(deps),
    ...createPlaylistSettingsHandlers(deps),
    ...createSeenArtistsHandlers(deps),
  };
}
