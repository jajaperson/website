import matter from "gray-matter";
import { DynamicEmitter } from "../build/emitters.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path/posix";
import { sluggifyVaultPath } from "../build/util/path.js";

export const contentPage: DynamicEmitter = {
	symbol: Symbol(),
	dynamic: true,
	async *preProcessor(ctx, vp) {
		if (!vp.endsWith(".md")) return;

		const fp = join(ctx.cfg.vault, vp);
		const rawFile = await readFile(fp);
		const { content, data } = matter(rawFile);

		// Make sure the frontmatter contains a public tag
		if (!Array.isArray(data.tags)) return;
		if (data.tags.includes("private") || !data.tags.includes("public")) return;

		yield {
			origin: vp,
			slug: sluggifyVaultPath(vp),
			content,
			data,
		};
	},
};
