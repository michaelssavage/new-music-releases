// authUtils.ts
import { isAuthValid, refreshAuthToken } from "@client/lib/Spotify/auth.ts";
import { redirect } from "@tanstack/react-router";
import Cookies from "js-cookie";

interface AuthState {
	isAuthenticated: boolean;
	accessToken: string | null;
}

export async function checkAuthState(): Promise<AuthState> {
	const accessToken = Cookies.get("spotify_access_token");
	const refreshToken = Cookies.get("spotify_refresh_token");

	if (!accessToken) {
		return { isAuthenticated: false, accessToken: null };
	}

	try {
		const status = await isAuthValid(accessToken);
		if (status === "OK") {
			return { isAuthenticated: true, accessToken };
		}

		if (refreshToken) {
			const newAccessToken = await refreshAuthToken(refreshToken);
			if (newAccessToken) {
				return { isAuthenticated: true, accessToken: newAccessToken };
			}
		}
	} catch (error) {
		console.error("Auth validation error:", error);
	}

	return { isAuthenticated: false, accessToken: null };
}

export async function requireAuth() {
	const { isAuthenticated, accessToken } = await checkAuthState();

	if (!isAuthenticated || !accessToken) {
		throw redirect({ to: "/login" });
	}

	return { isAuthenticated, accessToken };
}

export async function requireUnauth() {
	const { isAuthenticated } = await checkAuthState();

	if (isAuthenticated) {
		throw redirect({ to: "/" });
	}

	return { isAuthenticated };
}

export function setupAuthRefresh() {
	setInterval(
		async () => {
			const refreshToken = Cookies.get("spotify_refresh_token");
			const accessToken = Cookies.get("spotify_access_token");

			if (refreshToken && accessToken) {
				try {
					const status = await isAuthValid(accessToken);

					if (status !== "OK") {
						const newAccessToken = await refreshAuthToken(refreshToken);
						if (newAccessToken) {
							console.log("Access token refreshed successfully.");
						}
					}
				} catch (error) {
					console.error("Error during periodic token refresh:", error);
				}
			}
		},
		4 * 60 * 1000,
	);
}
