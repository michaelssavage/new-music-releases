import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "@server/utils/logger";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

(() => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const envPath = path.resolve(__dirname, "../.env");
	dotenv.config({ path: envPath });

	const secret = process.env.JWT_SECRET;
	const payload = { user: "michael", purpose: "admin" };

	if (secret) {
		const token = jwt.sign(payload, secret);
		logger.info(token);
	}
})();
