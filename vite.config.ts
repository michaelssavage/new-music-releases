import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
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
