import dotenv from "dotenv";
import { createServiceContainer } from "../server/container/index.js";

dotenv.config();

const { schedulerService } = createServiceContainer();

async function run() {
	try {
		console.log("Starting scheduled job...");
		await schedulerService.initialize(); // this checks last run and maybe triggers
		await schedulerService.shutdown(); // clean exit
		console.log("Scheduled job finished.");
		process.exit(0);
	} catch (err) {
		console.error("Scheduled job failed:", err);
		process.exit(1);
	}
}

run();
