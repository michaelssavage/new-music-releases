import { logger } from "@server/utils/logger.js";
import dotenv from "dotenv";
import { createServiceContainer } from "../server/container/index.js";

dotenv.config();

const { schedulerService } = createServiceContainer();

async function run() {
	try {
		logger.info("Starting scheduled job...");
		await schedulerService.initialize(); // this checks last run and maybe triggers
		schedulerService.shutdown(); // clean exit
		logger.info("Scheduled job finished.");
		process.exit(0);
	} catch (err) {
		console.error("Scheduled job failed:", err);
		process.exit(1);
	}
}

run();
