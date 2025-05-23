// authUtils
import { isAuthValid, refreshAuthToken } from "@client/lib/spotify";
import { redirect } from "@tanstack/react-router";
import Cookies from "js-cookie";
import { logger } from "./logger";

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
		const valid = await isAuthValid(accessToken);
		if (valid) {
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
					const valid = await isAuthValid(accessToken);

					if (valid) {
						const newAccessToken = await refreshAuthToken(refreshToken);
						if (newAccessToken) {
							logger.info("Access token refreshed successfully.");
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
