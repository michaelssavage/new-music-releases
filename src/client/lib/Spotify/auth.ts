import axios from "axios";

export const isAuthValid = async (accessToken: string) => {
	const res = await axios.get("http://localhost:5000/api/validate-token", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	return res.data;
};
