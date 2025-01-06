import path from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { defineConfig } from "vite";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
	plugins: [
		TanStackRouterVite(),
		viteReact({
			jsxImportSource: "@emotion/react",
			babel: {
				plugins: ["@emotion/babel-plugin"],
			},
		}),
	],
	server: {
		port: 3000,
		open: true,
	},
	preview: {
		port: 3000,
	},
	build: {
		outDir: path.resolve(__dirname, "../../dist/client"),
		emptyOutDir: true,
	},
});
