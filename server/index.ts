import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { createServiceContainer } from "./container/index.js";
import { SchedulerRouter } from "./router/scheduler.router.js";
import { SpotifyRouter } from "./router/spotify.router.js";
import { resolvePath } from "./utils/resolvePath.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const { spotifyService, redisService, schedulerService } =
	createServiceContainer();

const spotifyRouter = SpotifyRouter({ spotifyService });
const schedulerRouter = SchedulerRouter({ schedulerService });

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "UP" });
});

app.use("/api", spotifyRouter);
app.use("/api", schedulerRouter);

const clientPath = resolvePath("../client");
app.use(express.static(clientPath));

app.get("*", (_req, res) => {
	res.sendFile(path.join(clientPath, "index.html"));
});

app.use((_req: Request, res: Response, _next: NextFunction) => {
	res.status(404).json({ error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
	console.error(`Error in ${req.method} ${req.url}:`, err);
	res.status(500).json({ error: "Internal Server Error" });
});

async function startServer() {
	try {
		await spotifyService.initialize();
		await redisService.initialize();
		await schedulerService.initialize();

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to initialize services:", error);
		await shutdown();
		process.exit(1);
	}
}

async function shutdown() {
	console.log("Shutting down server...");

	try {
		await spotifyService.shutdown();
		await redisService.shutdown();
		await schedulerService.shutdown();

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
