import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import spotifyRouter from "./routes/spotify.router.ts";
import { SpotifyService } from "./services/spotify.sevice.ts";


const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api", spotifyRouter);

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "UP" });
});

app.use((_req: Request, res: Response, _next: NextFunction) => {
	res.status(404).json({ error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
	console.error(`Error in ${req.method} ${req.url}:`, err);
	res.status(500).json({ error: "Internal Server Error" });
});

const spotifyService = SpotifyService();

async function startServer() {
	try {
		await spotifyService.initialize();

		app.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		});
	} catch (error) {
		console.error("Failed to initialize SpotifyService:", error);
		process.exit(1);
	}
}

async function shutdown() {
	console.log("Shutting down server...");
	try {
		await spotifyService.shutdown();
		console.log("Spotify service disconnected.");
		process.exit(0);
	} catch (error) {
		console.error("Error during shutdown:", error);
		process.exit(1);
	}
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error);
	process.exit(1);
});

process.on("unhandledRejection", (reason) => {
	console.error("Unhandled promise rejection:", reason);
	process.exit(1);
});

startServer();
