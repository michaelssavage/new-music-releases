import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves a given relative path based on the root directory.
 *
 * @param {string} relativePath - The relative path to resolve.
 * @returns {string} - The resolved absolute path.
 * @example const envPath = resolvePath('.env');
 */
export const resolvePath = (relativePath: string): string => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const rootDir = path.resolve(currentDir, "../../");

  return path.resolve(rootDir, relativePath);
};
