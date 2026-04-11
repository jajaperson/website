import { Readable } from "node:stream";
import { BuildCtx } from "./ctx.js";
import { FullSlug, FilePath, VaultPath } from "./path.js";
import { dirname, join } from "node:path/posix";
import { copyFile, mkdir, writeFile } from "node:fs/promises";

/**
 * Writes content to the specified output directory given a destination slug.
 *
 * @param ctx context
 * @param slug destination slug
 * @param ext extension to append to the slug
 * @param content content to write
 * @returns the path written to
 */
export async function write(
	ctx: BuildCtx,
	slug: FullSlug,
	ext: `.${string}`,
	content: string | Buffer | Readable,
): Promise<FilePath> {
	const path = join(ctx.argv.output, slug + ext) as FilePath;
	const dir = dirname(path);
	await mkdir(dir, { recursive: true });
	await writeFile(path, content, { encoding: "utf-8" });
	return path;
}

/**
 * Copies a file from the vault to the specified output directory
 *
 * @param ctx context
 * @param src path to source in vault
 * @param dest destination slug
 * @returns the path written to
 */
export async function copy(ctx: BuildCtx, src: VaultPath, dest: FullSlug): Promise<FilePath> {
	const srcPath = join(ctx.cfg.vault, src) as FilePath;
	const destPath = join(ctx.argv.output, dest) as FilePath;
	const dir = dirname(destPath);
	await mkdir(dir, { recursive: true });
	await copyFile(srcPath, destPath);
	return destPath;
}
