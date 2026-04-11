import { join } from "node:path/posix";
import { DynamicEmitter, ProcessedFile } from "../src/emitters.js";
import { readFile } from "node:fs/promises";
import { BibLatexParser, CSLEntry, CSLExporter } from "biblatex-csl-converter";
import { FullSlug, VaultPath } from "../src/util/path.js";
import { BuildCtx } from "../src/util/ctx.js";
import { write } from "../src/util/write.js";
import { render } from "preact-render-to-string";

interface CSLAuthor {
	given: string;
	family: string;
}

export class LitNotes implements DynamicEmitter<CSLEntry> {
	symbol = Symbol();

	async *preProcess(ctx: BuildCtx, vp: VaultPath): AsyncIterableIterator<ProcessedFile<CSLEntry>> {
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

	async *parse(
		_: BuildCtx,
		current: ProcessedFile<CSLEntry>,
	): AsyncIterableIterator<ProcessedFile<CSLEntry>> {
		yield current;
	}

	async *render(ctx: BuildCtx, current: ProcessedFile<CSLEntry>) {
		const cit = current.content;
		const title = typeof cit.title === "string" ? cit.title : "Untitled";
		const authors: CSLAuthor[] = Array.isArray(cit.author) ? cit.author : [];

		const Authors = () => <p>{authors.map((a) => `${a.given} ${a.family}`).join(" • ")}</p>;
		const Title = () => <h1 dangerouslySetInnerHTML={{ __html: title }} />;
		const Ident = () =>
			typeof cit.DOI === "string" ? (
				<a href={`https://doi.org/${cit.DOI}`}>{cit.DOI}</a>
			) : typeof cit.ISBN === "string" ? (
				<a
					href={
						typeof cit.URL === "string"
							? cit.URL
							: `https://en.wikipedia.org/wiki/Special:BookSources/${cit.ISBN.split(" ")[0]}`
					}
				>
					{cit.ISBN.split(" ")[0]}
				</a>
			) : typeof cit.URL === "string" ? (
				<a href={cit.URL} class="external">
					{cit.URL}
				</a>
			) : null;
		const Container = () =>
			typeof cit["container-title"] === "string" ? (
				<p>
					in <em dangerouslySetInnerHTML={{ __html: cit["container-title"] }}></em>
				</p>
			) : null;
		const Abstract = () =>
			typeof cit.abstract === "string" ? (
				<blockquote class="callout abstract" data-callout="abstract">
					<div class="callout-title">
						<div class="callout-icon" />
						<div class="callout-title-inner">
							<p>Abstract</p>
						</div>
					</div>
					<div class="callout-content">
						<p dangerouslySetInnerHTML={{ __html: cit.abstract }} />
					</div>
				</blockquote>
			) : null;

		const page = (
			<html lang="en-GB" dir="ltr">
				<body>
					<article>
						<Authors />
						<Title />
						<Ident />
						<Container />
						<Abstract />
					</article>
				</body>
			</html>
		);

		yield write(ctx, current.slug, ".html", "<!DOCTYPE html>\n" + render(page));
	}
}
