import cors from "cors";
import dotenv from "dotenv";
import express, { type RequestHandler } from "express";
import { searchItem } from "../scripts/searchItem.ts";

interface SearchQuery {
	query: string;
	type: string;
	limit?: string;
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// biome-ignore lint/complexity/noBannedTypes: <explanation>
const searchHandler: RequestHandler<{}, {}, {}, SearchQuery> = async (
	req,
	res,
) => {
	const { query, type, limit } = req.query;

	if (!query || !type) {
		res.status(400).json({ error: "Missing required parameters" });
		return;
	}

	try {
		const data = await searchItem(query, type.split(","), Number(limit) || 10);
		res.json(data);
	} catch (error) {
		console.error("Search error:", error);
		res.status(500).json({ error: "Failed to search" });
	}
};

app.get("/api/search", searchHandler);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
