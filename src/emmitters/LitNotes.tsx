import { join } from "node:path/posix";
import { DynamicEmitter, ProcessedFile } from "../emitters.js";
import { readFile } from "node:fs/promises";
import { BibLatexParser, CSLEntry, CSLExporter } from "biblatex-csl-converter";
import { FullSlug, VaultPath } from "../util/path.js";
import { BuildCtx } from "../util/ctx.js";
import { write } from "../util/write.js";
import { render } from "preact-render-to-string";
import { renderJsx } from "../util/jsx.js";
import { LitNotePage } from "../components/pages/LitNotePage.js";

export class LitNotes implements DynamicEmitter<CSLEntry> {
	symbol = Symbol();

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
			const slug = join("Sources", `@${id}`) as FullSlug;

			yield {
				origin: vp,
				slug,
				content: entry,
				emitter: this.symbol,
			};
		}
	}

	async *render(ctx: BuildCtx, current: ProcessedFile<CSLEntry>) {
		yield write(ctx, current.slug, ".html", renderJsx(<LitNotePage entry={current.content} />));
	}
}
