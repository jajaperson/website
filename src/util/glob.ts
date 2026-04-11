/**
 * Based on <https://github.com/jackyzha0/quartz/blob/v4/quartz/util/glob.ts>
 */

import path from "path";
import { VaultPath } from "./path.js";
import { globbyStream } from "globby";

/**
 * Converts a path into POSIX form.
 *
 * @param fp path to convert
 * @returns POSIX version of the path
 */
export function toPosixPath(fp: string): string {
	return fp.split(path.sep).join(path.posix.sep);
}

/**
 * Resolves a glob pattern in the vault asynchronously.
 *
 * @param pattern glob pattern
 * @param vault path to vault
 * @param ignorePatterns glob patterns to exclude
 */
export async function* glob(
	pattern: string,
	vault: string,
	ignorePatterns: string[] = [],
): AsyncIterableIterator<VaultPath> {
	const stream = globbyStream(pattern, {
		cwd: vault,
		ignore: ignorePatterns,
		gitignore: true,
	});
	for await (const file of stream) {
		yield toPosixPath(file) as VaultPath;
	}
}
