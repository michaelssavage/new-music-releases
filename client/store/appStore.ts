import type { SavedArtistI } from "@model/spotify";
import Cookies from "js-cookie";
import { create } from "zustand";

interface StoreState {
  isAuthenticated: boolean;
  userId: string | null;
  savedArtists: Array<SavedArtistI>;
  savedArtistsLoaded: boolean;
  refetchArtists: (() => void) | null;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (isOpen: boolean) => void;
  login: (accessToken: string, refreshToken: string, userId: string) => void;
  logout: () => void;
  setSavedArtists: (artists: Array<SavedArtistI>) => void;
  setRefetchArtists: (refetch: () => void) => void;
}

export const useAppStore = create<StoreState>((set) => ({
  isAuthenticated: !!Cookies.get("spotify_access_token"),
  userId: Cookies.get("spotify_user_id") || null,
  savedArtists: [],
  savedArtistsLoaded: false,
  refetchArtists: null,
  isSidebarOpen: false,
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  isSearchOpen: false,
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  login: (accessToken, refreshToken, userId) => {
    Cookies.set("spotify_access_token", accessToken, {
      secure: true,
      sameSite: "Strict",
      expires: 1 / 24, // 1 hour expiration
    });
    Cookies.set("spotify_refresh_token", refreshToken, {
      secure: true,
      sameSite: "Strict",
      expires: 7, // 7 days expiration for refresh token
    });

    Cookies.set("spotify_user_id", userId, {
      secure: true,
      sameSite: "Strict",
      expires: 7,
    });

    set({ isAuthenticated: true, userId });
  },
  logout: () => {
    Cookies.remove("spotify_access_token");
    Cookies.remove("spotify_refresh_token");
    Cookies.remove("spotify_user_id");
    set({
      isAuthenticated: false,
      userId: null,
      savedArtists: [],
      savedArtistsLoaded: false,
    });
  },
  setSavedArtists: (artists: Array<SavedArtistI>) =>
    set({ savedArtists: artists, savedArtistsLoaded: true }),
  setRefetchArtists: (refetch: () => void) => set({ refetchArtists: refetch }),
}));
