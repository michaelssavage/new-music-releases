import axios from "axios";
import Cookies from "js-cookie";

export const isAuthValid = async (accessToken: string) => {
	const res = await axios.get("http://localhost:5000/api/validate-token", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	return res.data;
};

export async function refreshAuthToken(
	refreshToken: string,
): Promise<string | null> {
	try {
		const { data } = await axios.post(
			"http://localhost:5000/api/refresh-token",
			{
				refresh_token: refreshToken,
			},
		);
		const { access_token } = data;

		if (access_token) {
			Cookies.set("spotify_access_token", access_token, { expires: 1 }); // 1 day expiration
			return access_token;
		}
	} catch (error) {
		console.error("Failed to refresh token:", error);
	}
	return null;
}
