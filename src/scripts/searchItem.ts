import axios from "axios";
import dotenv from "dotenv";
import { SPOTIFY_API_URL } from "../utils/constants.ts";
import { getAccessToken } from "./getAccessToken.ts";

dotenv.config();

export const searchItem = async (
	query: string,
	type: Array<string>,
	limit = 10,
) => {
	const accessToken = await getAccessToken();

	try {
		const { data } = await axios.get(
			`${SPOTIFY_API_URL}/search?q=${query}&type=${type.join(",")}&limit=${limit}`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);
		console.log("Search results:", data);
		return data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Error searching spotify:",
				error.response?.data || error.message,
			);
		}
		return {
			total: 0,
			items: [],
		};
	}
};
