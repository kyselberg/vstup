import { existsSync, lstatSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Walks up parent directories until it finds a target folder.
 * @param targetDir Name of the directory to find (e.g. "data")
 * @param startDir Directory to start from (default = current file)
 */
export function findParentDir(
  targetDir: string,
  startDir: string = dirname(fileURLToPath(import.meta.url))
): string | null {
  let dir = startDir;

  while (dir !== dirname(dir)) {
    const possible = join(dir, targetDir);
    if (existsSync(possible) && lstatSync(possible).isDirectory()) {
      return possible; // absolute path
    }
    dir = dirname(dir); // go up one level
  }

  return null; // not found
}
