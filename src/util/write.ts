import { Readable } from "node:stream";
import { BuildCtx } from "./ctx.js";
import { FullSlug, FilePath } from "./path.js";
import { dirname, join } from "node:path/posix";
import { mkdir, writeFile } from "node:fs/promises";

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
