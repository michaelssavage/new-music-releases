import axios from "axios";

export const getSavedArtists = async () => {
	const { data } = await axios.get("http://localhost:5000/api/get-artists");
	return data;
};
