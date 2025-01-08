/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly SERVER_URL: string; // Add other variables as needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
