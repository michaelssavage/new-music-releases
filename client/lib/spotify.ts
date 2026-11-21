import { logger } from "@client/utils/logger";
import type { SessionI } from "@model/accounts";
import type {
  PlaylistNameInputI,
  PlaylistRole,
  PlaylistSelectionInputI,
  PlaylistSettingsResponse,
  PlaylistSummaryI,
  UserPlaylistsResponse,
} from "@model/playlist-settings";
import type { SchedulerRunsResponse } from "@model/scheduler";
import type {
  SeenArtistInputI,
  SeenArtistsResponse,
} from "@model/seen-artists";
import type { SavedArtistI, SpotifyDataProps } from "@model/spotify";
import type { Artist } from "@model/spotify/liked-tracks";
import type { SaveSongRequestI } from "@model/spotify/playlist";
import type { SearchProps } from "@model/spotify/search";
import type { UserID } from "@model/spotify/user";
import axios from "axios";
import Cookies from "js-cookie";

export const isAuthValid = async (accessToken: string): Promise<boolean> => {
  try {
    const res = await axios.get("/api/validate-token", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data.status === "OK";
  } catch {
    return false;
  }
};

export async function refreshAuthToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const { data } = await axios.post("/api/refresh-token", {
      refresh_token: refreshToken,
    });
    const { access_token } = data;

    if (access_token) {
      Cookies.set("spotify_access_token", access_token, {
        expires: new Date(Date.now() + 3600 * 1000),
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
      }); // 1 hour
      return access_token;
    }
  } catch (error) {
    logger.error("refreshAuthToken:Failed to refresh token:", error);
  }
  return null;
}

export const getUser = async (userId: UserID) => {
  try {
    const res = await axios.get(`/api/user?userId=${userId}`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "getUser:Failed to get user:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("getUser:An unexpected error occurred:", error);
    }
    return null;
  }
};

export const saveArtist = async ({
  userId,
  data,
}: {
  userId: UserID;
  data: Artist;
}) => {
  try {
    logger.info(`saveArtist:Saving ${data.name}`, data.id);
    return await axios.post("/api/save-artists", {
      userId,
      artists: [data],
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "Failed to save artist:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("saveArtist:An unexpected error occurred:", error);
    }
  }
};

export const removeArtist = async ({
  userId,
  name,
  id,
}: {
  userId: UserID;
  name: string;
  id: string;
}) => {
  try {
    logger.info(`removeArtist:Removing Artist ${name} with id ${id}`);
    await axios.delete(`/api/remove-artist/${id}?userId=${userId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "removeArtist:Failed to remove artist:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("removeArtist:An unexpected error occurred:", error);
    }
    return null;
  }
};

export const getArtist = async (id?: string) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    const res = await axios.get<Artist>(`/api/get-artist/${id}`, {
      headers: { spotify_access_token },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "getArtist:Failed to get artist:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("getArtist:An unexpected error occurred:", error);
    }
    return null;
  }
};

export const getSavedArtists = async (userId: UserID) => {
  const accessToken = Cookies.get("spotify_access_token");

  if (!accessToken) {
    return [];
  }

  try {
    const res = await axios.get<Array<SavedArtistI>>(
      `/api/get-artists?userId=${userId}`,
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "getSavedArtists:Failed to get saved artists:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("getSavedArtists:An unexpected error occurred:", error);
    }
    return [];
  }
};

export const getSeenArtists = async () => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    const res = await axios.get<SeenArtistsResponse>("/api/seen-artists", {
      headers: { spotify_access_token },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "getSeenArtists:Failed to get seen artists:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("getSeenArtists:An unexpected error occurred:", error);
    }
    throw error;
  }
};

export const getUserTracks = async () => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    const res = await axios.get("/api/saved-tracks", {
      headers: { spotify_access_token },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "getUserTracks:Failed to get user tracks:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("getUserTracks:An unexpected error occurred:", error);
    }
    return null;
  }
};

export const getNextTracks = async (nextUrl: string) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    const res = await axios.get(nextUrl, {
      headers: {
        Authorization: `Bearer ${spotify_access_token}`,
      },
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "getNextTracks:Failed to get next tracks:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("getNextTracks:An unexpected error occurred:", error);
    }
    return null;
  }
};

function apiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    logger.error(fallback, error.response?.data || error.message);
    return error.response?.data?.error ?? fallback;
  }
  logger.error(fallback, error);
  return fallback;
}

export const addSeenArtist = async (input: SeenArtistInputI) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    await axios.post("/api/seen-artists", input, {
      headers: { spotify_access_token },
    });
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Couldn't add artist"));
  }
};

export const updateSeenArtist = async ({
  id,
  ...input
}: SeenArtistInputI & { id: string }) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    await axios.put(`/api/seen-artists/${id}`, input, {
      headers: { spotify_access_token },
    });
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Couldn't update artist"));
  }
};

export const deleteSeenArtist = async (id: string) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    await axios.delete(`/api/seen-artists/${id}`, {
      headers: { spotify_access_token },
    });
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Couldn't delete artist"));
  }
};

export const fetchSearchResults = async ({
  search,
  type,
  limit = 10,
}: SearchProps) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  const res = await axios.get("/api/search", {
    headers: { spotify_access_token },
    params: {
      q: search,
      type: type.join(","),
      limit: limit,
    },
  });
  return res.data;
};

export const getSpotifyPlaylist = async (
  userId: UserID,
  page: { offset: number; limit: number },
) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    const res = await axios.get<SpotifyDataProps>("/api/get-playlist", {
      headers: { spotify_access_token },
      params: { userId, ...page },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "getSpotifyPlaylist:Failed to get playlist:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("getSpotifyPlaylist:An unexpected error occurred:", error);
    }
    throw error;
  }
};

export const updateSpotifyPlaylistReleases = async (userId: UserID) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    const res = await axios.get(
      `/api/update-playlist-releases?userId=${userId}`,
      {
        headers: { spotify_access_token },
      },
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "updateSpotifyPlaylistReleases:Failed to get spotify playlist releases:",
        error.response?.data || error.message,
      );
    } else {
      logger.error(
        "updateSpotifyPlaylistReleases:An unexpected error occurred:",
        error,
      );
    }
    throw error;
  }
};

export const saveSongToPlaylist = async ({
  userId,
  trackId,
  playlistId,
}: SaveSongRequestI) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  if (!playlistId) {
    logger.error("saveSongToPlaylist:No playlistId provided");
    throw new Error("No playlistId provided");
  }

  try {
    const res = await axios.post(
      "/api/save-song-to-playlist",
      { userId, trackId, playlistId },
      {
        headers: {
          spotify_access_token,
        },
      },
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "saveSongToPlaylist:Failed to save song to playlist:",
        error.response?.data || error.message,
      );
      throw new Error(error.response?.data?.message || error.message);
    }
    logger.error("saveSongToPlaylist:An unexpected error occurred:", error);
    throw new Error("Unknown error");
  }
};

export const getPlaylistTracks = async (playlistId?: string) => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  if (!playlistId) {
    logger.error("getPlaylistTracks:No playlistId provided");
    return null;
  }

  try {
    const res = await axios.get(`/api/get-playlist-tracks/${playlistId}`, {
      headers: { spotify_access_token },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "getPlaylistTracks:Failed to get playlist tracks:",
        error.response?.data || error.message,
      );
    } else {
      logger.error("getPlaylistTracks:An unexpected error occurred:", error);
    }
    return null;
  }
};

export const getSchedulerRuns = async () => {
  const spotify_access_token = Cookies.get("spotify_access_token");

  try {
    const res = await axios.get<SchedulerRunsResponse>("/api/scheduler-runs", {
      headers: { spotify_access_token },
    });
    return res.data.runs;
  } catch (error) {
    logger.error("getSchedulerRuns:Failed to get scheduler runs:", error);
    throw error;
  }
};

const spotifyHeaders = () => ({
  spotify_access_token: Cookies.get("spotify_access_token"),
});

export const getSession = async () => {
  const res = await axios.get<SessionI>("/api/session", {
    headers: spotifyHeaders(),
  });
  return res.data;
};

export const getPlaylistSettings = async () => {
  const res = await axios.get<PlaylistSettingsResponse>(
    "/api/playlist-settings",
    { headers: spotifyHeaders() },
  );
  return res.data;
};

export const getUserPlaylists = async (): Promise<Array<PlaylistSummaryI>> => {
  const res = await axios.get<UserPlaylistsResponse>("/api/user-playlists", {
    headers: spotifyHeaders(),
  });
  return res.data.playlists;
};

export const selectPlaylist = async ({
  role,
  playlistId,
}: { role: PlaylistRole } & PlaylistSelectionInputI) => {
  try {
    await axios.put(
      `/api/playlist-settings/${role}`,
      { playlistId } satisfies PlaylistSelectionInputI,
      { headers: spotifyHeaders() },
    );
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Couldn't change playlist"));
  }
};

export const createPlaylist = async ({
  role,
  name,
}: { role: PlaylistRole } & PlaylistNameInputI) => {
  try {
    await axios.post(
      `/api/playlist-settings/${role}`,
      { name } satisfies PlaylistNameInputI,
      { headers: spotifyHeaders() },
    );
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Couldn't create playlist"));
  }
};

export const renamePlaylist = async ({
  role,
  name,
}: { role: PlaylistRole } & PlaylistNameInputI) => {
  try {
    await axios.patch(
      `/api/playlist-settings/${role}`,
      { name } satisfies PlaylistNameInputI,
      { headers: spotifyHeaders() },
    );
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Couldn't rename playlist"));
  }
};
