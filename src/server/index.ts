import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import spotifyRouter from "./routes/spotify.router.ts";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.use("/api", spotifyRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
	res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
