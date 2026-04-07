import { join } from "node:path/posix";
import { DynamicEmitter } from "../build/emitters.js";
import { readFile } from "node:fs/promises";
import { BibLatexParser, CSLExporter } from "biblatex-csl-converter";
import { FullSlug } from "../build/util/path.js";

export const litNotes: DynamicEmitter = {
	symbol: Symbol(),
	dynamic: true,
	async *preProcessor(ctx, vp) {
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
				data: { entry },
			};
		}
	},
};
