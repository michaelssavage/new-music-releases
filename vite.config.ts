import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
	build: {
		outDir: path.resolve(__dirname, "dist/client"),
	},
	resolve: {
		alias: {
			"@client": path.resolve(__dirname, "src/client"),
		},
	},
});
