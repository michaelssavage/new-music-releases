import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { createServiceContainer } from "./container/index.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { SchedulerRouter } from "./router/scheduler.router.js";
import { SpotifyRouter } from "./router/spotify.router.js";
import { resolvePath } from "./utils/resolvePath.js";

const envPath = resolvePath(".env");
dotenv.config({ path: envPath });

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const { spotifyService, schedulerService, api, env } = createServiceContainer();

const spotifyRouter = SpotifyRouter({ spotifyService, api, env });
const schedulerRouter = SchedulerRouter({ schedulerService, env });

// === MIDDLEWARE ===
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// === ROUTES ===
app.get("/health", (_req, res) => {
	res.status(200).json({ status: "UP" });
});

app.use("/api", spotifyRouter);
app.use("/api", schedulerRouter);

// === CLIENT FRONTEND ===
const clientPath = resolvePath("client");
app.use(express.static(clientPath));

app.get("*", (_req, res) => {
	res.sendFile(path.join(clientPath, "index.html"));
});

// === 404 HANDLER ===
app.use((_req: Request, res: Response, _next: NextFunction) => {
	res.status(404).json({ error: "Route not found" });
});

// === CUSTOM ERROR HANDLER ===
app.use(errorMiddleware);

async function startServer() {
	try {
		await spotifyService.initialize();
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
		await schedulerService.shutdown();

		process.exit(0);
	} catch (error) {
		console.error("Error during shutdown:", error);
		process.exit(1);
	}
}

// === GLOBAL ERROR HANDLING ===
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
