import axios from "axios";

export const logError = (error: unknown) => {
	if (axios.isAxiosError(error)) {
		console.error("Error:", error.response?.data || error.message);
	}
};
