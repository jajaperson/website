import { readFile } from "node:fs/promises";
import { join } from "node:path/posix";

import { BibLatexParser, CSLEntry, CSLExporter } from "biblatex-csl-converter";

import { LitNotePage } from "../components/pages/LitNotePage.js";
import { DynamicEmitter, PreprocessedFile } from "../emitters.js";
import { BuildCtx } from "../util/ctx.js";
import { renderJsx } from "../util/jsx.js";
import { FullSlug, VaultPath } from "../util/path.js";
import { write } from "../util/write.js";

export class LitNotes implements DynamicEmitter {
	symbol = Symbol();
	entries: Map<string, CSLEntry> = new Map();

	async *preProcess(ctx: BuildCtx, vp: VaultPath) {
		if (!vp.endsWith(".bib")) return;

		const fp = join(ctx.cfg.vault, vp);
		const rawBib = await readFile(fp, { encoding: "utf-8" });

		let parser = new BibLatexParser(rawBib);
		const bib = await parser.parseAsync();
		let exporter = new CSLExporter(bib.entries, false, { useEntryKeys: true });
		const csl = exporter.parse();

		for (const id in csl) {
			const entry = csl[id];
			this.entries.set(id, entry);
			const slug = join("Sources", `@${id}`) as FullSlug;

			yield {
				origin: vp,
				slug,
				emitter: this.symbol,
				data: { id },
			};
		}
	}

	async render(ctx: BuildCtx, current: PreprocessedFile) {
		const content = this.entries.get(current.data?.id);
		if (content) {
			return write(ctx, current.slug, ".html", renderJsx(<LitNotePage entry={content} />));
		} else {
			throw new Error(`Error processing citation ${current.data?.id}`);
		}
	}
}
