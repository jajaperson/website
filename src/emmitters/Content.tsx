import matter from "gray-matter";
import { DynamicEmitter, ProcessedFile } from "../emitters.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path/posix";
import {
	FullSlug,
	resolveSlug as resolveSlug,
	sluggifyVaultPath,
	VaultPath,
} from "../util/path.js";
import { Image, Link, Root as MdRoot, Node, Parent, PhrasingContent } from "mdast";
import { Plugin, Processor, unified } from "unified";
import remarkParse from "remark-parse";
import { BuildCtx } from "../util/ctx.js";
import remarkRehype from "remark-rehype";
import { render } from "preact-render-to-string";
import { write } from "../util/write.js";
import { htmlToJsx } from "../util/jsx.js";
import remarkMath from "@jajaperson/remark-math";
import rehypeMathJaxSvg from "@jajaperson/rehype-mathjax/svg";
import { loadMacrosFromPreamble, Macros } from "../util/loadPreamble.js";
import remarkGfm from "remark-gfm";
import remarkInlineFootnote from "remark-inline-footnote";
import { wikilink } from "micromark-extension-wikilink-syntax";
import {
	AliasWikilink,
	AltWikilinkEmbed,
	Wikilink,
	WikilinkEmbed,
	wikilinkFromMarkdown,
} from "mdast-util-wikilink-syntax";
import { SKIP, visit } from "unist-util-visit";
import { ok as assert } from "devlop";
import { Root as HtmlRoot } from "hast";
import { VFile } from "vfile";
import isAbsoluteUrl from "is-absolute-url";

function wikilinkPlugin(allSlugs: FullSlug[]): Plugin {
	return function () {
		const data = this.data();

		const micromarkExtensions = (data.micromarkExtensions ??= []);
		const fromMarkdownExtensions = (data.fromMarkdownExtensions ??= []);

		micromarkExtensions.push(wikilink());
		fromMarkdownExtensions.push(wikilinkFromMarkdown());

		return function (tree, vf) {
			visit(tree, ["wikilink", "aliasWikilink"], function (n, index, parent: Parent) {
				assert(typeof vf.data.file?.slug === "string", "expected ProcessedFile in data");

				const node = n as Wikilink | AliasWikilink;
				assert(parent && typeof index === "number", "Received orphaned wikilink");

				const resolved = isAbsoluteUrl(node.destination)
					? node.destination
					: (resolveSlug(vf.data.file.slug, node.destination, allSlugs) ?? node.destination);

				const children: PhrasingContent[] =
					node.type === "aliasWikilink"
						? node.children
						: [
								{
									type: "text",
									value: node.destination,
								},
							];

				const link: Link = {
					type: "link",
					url: resolved,
					children,
				};

				parent.children[index] = link;
				return SKIP;
			});

			visit(tree, ["wikilinkEmbed", "altWikilinkEmbed"], function (n, index, parent: Parent) {
				assert(typeof vf.data.file?.slug === "string", "expected ProcessedFile in data");

				const node = n as WikilinkEmbed | AltWikilinkEmbed;
				assert(parent && typeof index === "number", "Received orphaned wikilink embed");

				const resolved = isAbsoluteUrl(node.destination)
					? node.destination
					: (resolveSlug(vf.data.file.slug, node.destination, allSlugs) ?? node.destination);

				const image: Image = {
					type: "image",
					url: resolved,
				};

				if (node.type === "altWikilinkEmbed") image.alt = node.alt;

				parent.children[index] = image;
				return SKIP;
			});
		};
	};
}

export class ContentPage implements DynamicEmitter<string, MdRoot> {
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

		yield {
			origin: vp,
			slug: sluggifyVaultPath(vp),
			content,
			data,
			emitter: this.symbol,
		};
	}

	preParse(_: BuildCtx, all: ProcessedFile<string>[]): void {
		const allSlugs = all.map((f) => f.slug);

		this.mdProcessor = unified()
			.use(remarkParse)
			.use(remarkMath)
			.use(remarkGfm)
			.use(remarkInlineFootnote)
			.use(wikilinkPlugin(allSlugs)) as unknown as Processor<MdRoot, MdRoot, MdRoot>;
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
		this.hProcessor = unified()
			.use(remarkRehype, { allowDangerousHtml: true })
			// @ts-ignore don't really know why
			.use(rehypeMathJaxSvg, {
				tex: { macros: this.macros },
			});
	}

	async *render(ctx: BuildCtx, current: ProcessedFile<MdRoot>) {
		assert(this.hProcessor);

		const hast = await this.hProcessor.run(current.content, new VFile({ data: { file: current } }));
		const content = htmlToJsx(hast);

		const page = (
			<html lang="en-GB" dir="ltr">
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				</head>
				<body>
					<article>{content}</article>
				</body>
			</html>
		);

		yield write(ctx, current.slug, ".html", "<!DOCTYPE html>\n" + render(page));
	}
}
