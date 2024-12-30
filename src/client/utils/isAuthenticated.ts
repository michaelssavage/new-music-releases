// authUtils.ts
import { isAuthValid } from "@client/lib/Spotify/auth.ts";
import { redirect } from "@tanstack/react-router";
import Cookies from "js-cookie";

interface AuthState {
	isAuthenticated: boolean;
	accessToken: string | null;
}

export async function checkAuthState(): Promise<AuthState> {
	const accessToken = Cookies.get("spotify_access_token");

	if (!accessToken) {
		return { isAuthenticated: false, accessToken: null };
	}

	try {
		const status = await isAuthValid(accessToken);
		return {
			isAuthenticated: status === "OK",
			accessToken: status === "OK" ? accessToken : null,
		};
	} catch (error) {
		console.error("Auth validation error:", error);
		return { isAuthenticated: false, accessToken: null };
	}
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
