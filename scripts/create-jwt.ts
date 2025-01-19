import { resolvePath } from "@server/utils/resolvePath";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

(async () => {
	const envPath = resolvePath("../../.env");
	dotenv.config({ path: envPath });

	const secret = process.env.JWT_SECRET;
	const payload = { user: "michael", purpose: "admin" };

	if (secret) {
		const token = jwt.sign(payload, secret);
		console.log(token);
	}
})();
