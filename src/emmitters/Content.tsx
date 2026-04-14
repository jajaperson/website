import matter from "gray-matter";
import type { DynamicEmitter, ProcessedFile } from "../emitters.js";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path/posix";
import { sluggifyVaultPath } from "../util/path.js";
import type { VaultPath } from "../util/path.js";
import type { Root as MdRoot } from "mdast";
import type { Processor } from "unified";
import type { BuildCtx } from "../util/ctx.js";
import { write } from "../util/write.js";
import { htmlToJsx } from "../util/jsx.js";
import { loadMacrosFromPreamble, Macros } from "../util/loadPreamble.js";
import { ok as assert } from "devlop";
import type { Root as HtmlRoot } from "hast";
import { VFile } from "vfile";
import { renderJsx } from "../util/jsx.js";
import { ContentPage } from "../components/pages/ContentPage.js";
import { createHtmlProcessor, createMdProcessor } from "../util/unified.js";

export class Content implements DynamicEmitter<string, MdRoot> {
	symbol = Symbol();

	macros: Macros;
	hProcessor?: Processor<undefined, MdRoot, HtmlRoot>;
	mdProcessor?: Processor<MdRoot, MdRoot, MdRoot>;

	constructor(preamble: string) {
		this.macros = loadMacrosFromPreamble(preamble);
	}

	async *preProcess(ctx: BuildCtx, vp: VaultPath) {
		if (!vp.endsWith(".md")) return;

		const fp = join(ctx.cfg.vault, vp);
		const rawFile = (await readFile(fp, "utf-8")).replaceAll(
			String.raw`\Set`,
			String.raw`{\cat{Set}}`,
		); // bodge
		const { content, data } = matter(rawFile);

		// Make sure the frontmatter contains a public tag
		if (!Array.isArray(data.tags)) return;
		if (data.tags.includes("private") || !data.tags.includes("public")) return;

		data.title ??= basename(vp, ".md");

		yield {
			origin: vp,
			slug: sluggifyVaultPath(vp),
			content,
			data,
			emitter: this.symbol,
		};
	}

	preParse(_: BuildCtx, all: ProcessedFile<string>[]): void {
		this.mdProcessor = createMdProcessor();
	}

	async *parse(ctx: BuildCtx, current: ProcessedFile<string>, all: ProcessedFile<string>[]) {
		// if (!current.origin?.endsWith("1-dimensional irreps of a finite symmetric group.md")) return; // debugging
		assert(this.mdProcessor);

		const vf = new VFile({ value: current.content, data: { file: current } });

		const mdast = this.mdProcessor.parse(vf);
		const transformed = await this.mdProcessor.run(mdast, vf);

		yield {
			...current,
			content: transformed,
		};
	}

	preRender(ctx: BuildCtx, all: ProcessedFile<any>[]): Promise<void> | void {
		this.hProcessor = createHtmlProcessor(all, { macros: this.macros });
	}

	async *render(ctx: BuildCtx, current: ProcessedFile<MdRoot>) {
		assert(this.hProcessor);

		const hast = await this.hProcessor.run(current.content, new VFile({ data: { file: current } }));
		yield write(
			ctx,
			current.slug,
			".html",
			renderJsx(<ContentPage fileData={current}>{htmlToJsx(hast)}</ContentPage>),
		);
	}
}
