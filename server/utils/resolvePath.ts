import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves a given relative path based on the current file's directory.
 *
 * @param {string} relativePath - The relative path to resolve.
 * @returns {string} - The resolved absolute path.
 * @example const envPath = resolvePath('../../.env');
 */
export const resolvePath = (relativePath: string): string => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	return path.resolve(__dirname, relativePath);
};
