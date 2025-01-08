import Cookies from "js-cookie";
import { create } from "zustand";

interface AuthState {
	isAuthenticated: boolean;
	login: (accessToken: string, refreshToken: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated: !!Cookies.get("spotify_access_token"),
	login: (accessToken, refreshToken) => {
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
		set({ isAuthenticated: true });
	},
	logout: () => {
		Cookies.remove("spotify_access_token");
		Cookies.remove("spotify_refresh_token");
		set({ isAuthenticated: false });
	},
}));
