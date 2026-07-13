import { readFile } from "node:fs/promises";
import { basename, join } from "node:path/posix";

import { ok as assert } from "devlop";
import matter from "gray-matter";
import type { Root as HtmlRoot } from "hast";
import type { Root as MdRoot } from "mdast";
import type { Processor } from "unified";
import { VFile } from "vfile";
import { reporter } from "vfile-reporter";

import { ContentPage } from "../components/pages/ContentPage.js";
import type { DynamicEmitter, PreprocessedFile } from "../emitters.js";
import type { BuildCtx } from "../util/ctx.js";
import { htmlToJsx } from "../util/jsx.js";
import { renderJsx } from "../util/jsx.js";
import { Macros, loadMacrosFromPreamble } from "../util/loadPreamble.js";
import { sluggifyVaultPath } from "../util/path.js";
import type { VaultPath } from "../util/path.js";
import { createHtmlProcessor, createMdProcessor } from "../util/unified.js";
import { write } from "../util/write.js";

export class Content implements DynamicEmitter {
	symbol = Symbol();

	macros: Macros;
	hProcessor?: Processor<undefined, MdRoot, HtmlRoot>;
	mdProcessor?: Processor<MdRoot, MdRoot, MdRoot>;

	constructor(preamble: string) {
		this.macros = loadMacrosFromPreamble(preamble);
	}

	/**
	 * Content preprocessor
	 *
	 * - Some string replacements
	 * - Process frontmatter
	 */
	async *preProcess(ctx: BuildCtx, vp: VaultPath) {
		if (!vp.endsWith(".md")) return;

		const fp = join(ctx.cfg.vault, vp);
		const rawFile = (await readFile(fp, "utf-8")).replaceAll(
			String.raw`\Set`,
			String.raw`{\cat{Set}}`,
		); // bodge
		const { data } = matter(rawFile);

		// Make sure the frontmatter contains a public tag
		if (!Array.isArray(data.tags)) return;
		if (data.tags.includes("private") || !data.tags.includes("public")) return;

		data.title ??= basename(vp, ".md");

		yield {
			origin: vp,
			slug: sluggifyVaultPath(vp),
			data,
			emitter: this.symbol,
		};
	}

	preRender(ctx: BuildCtx, all: PreprocessedFile[]): Promise<void> | void {
		this.mdProcessor = createMdProcessor();
		this.hProcessor = createHtmlProcessor(all, { macros: this.macros });
	}

	async render(ctx: BuildCtx, current: PreprocessedFile) {
		assert(this.mdProcessor);

		const fp = join(ctx.cfg.vault, current.origin!); // bodge
		const rawFile = (await readFile(fp, "utf-8")).replaceAll(
			String.raw`\Set`,
			String.raw`{\cat{Set}}`,
		); // bodge

		const vf = new VFile({
			value: matter(rawFile).content,
			data: { file: current },
			path: current.origin,
		});

		const mdast = this.mdProcessor.parse(vf);
		const transformed = await this.mdProcessor.run(mdast, vf);

		if (vf.messages.some((msg) => msg.fatal !== undefined))
			console.log(reporter(vf, { traceLimit: 1 }));

		assert(this.hProcessor);

		const hast = await this.hProcessor.run(transformed, vf);

		if (vf.messages.some((msg) => msg.fatal !== undefined))
			console.log(reporter(vf, { traceLimit: 1 }));

		return await write(
			ctx,
			current.slug,
			".html",
			renderJsx(<ContentPage file={current}>{htmlToJsx(hast)}</ContentPage>),
		);
	}
}
