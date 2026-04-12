import type { Plugin, Processor } from "unified";
import { unified } from "unified";
import type { FullSlug } from "./path.js";
import { resolveSlugToFile } from "./path.js";
import remarkParse from "remark-parse";
import remarkMath from "@jajaperson/remark-math";
import remarkGfm from "remark-gfm";
import remarkInlineFootnote from "remark-inline-footnote";
import rehypeMathJaxSvg from "@jajaperson/rehype-mathjax/svg";
import { SKIP, visit } from "unist-util-visit";
import { ok as assert } from "devlop";
import type { Image, Link, Parent, PhrasingContent, Root as MdRoot } from "mdast";
import type {
	AliasWikilink,
	AltWikilinkEmbed,
	Wikilink,
	WikilinkEmbed,
} from "mdast-util-wikilink-syntax";
import { wikilinkFromMarkdown } from "mdast-util-wikilink-syntax";
import { wikilink } from "micromark-extension-wikilink-syntax";
import isAbsoluteUrl from "is-absolute-url";
import { Macros } from "./loadPreamble.js";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import { Root as HtmlRoot } from "hast";
import { ProcessedFile } from "../emitters.js";
import { dirname, relative } from "node:path/posix";
import { slug as slugAnchor } from "github-slugger";

export function createMdProcessor({
	all,
}: {
	all: ProcessedFile[];
}): Processor<MdRoot, MdRoot, MdRoot> {
	return unified()
		.use(remarkParse)
		.use(remarkMath)
		.use(remarkGfm)
		.use(remarkInlineFootnote)
		.use(wikilinkPlugin(all)) as unknown as Processor<MdRoot, MdRoot, MdRoot>;
}

/**
 * Extract phrasing content from a tree which we think only contains phrasing
 * content.
 *
 * @param tree original tree
 * @returns
 *   phrasing content fo the first node if it is a paragraph, otherwise an
 *   empty list.
 */
export function extractPhrasing(tree: MdRoot): PhrasingContent[] {
	const paragraph = tree.children[0];
	if (paragraph?.type === "paragraph") {
		return paragraph.children;
	}
	return [];
}

const blockAnchorRegex = /#\^(\w+)$/;

function wikilinkPlugin(all: ProcessedFile[]): Plugin {
	const mathLinkPipeline = unified().use(remarkParse).use(remarkMath);

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

				let resolved = node.destination;
				let children: PhrasingContent[] =
					node.type === "aliasWikilink"
						? node.children
						: [
								{
									type: "text",
									value: node.destination.split("#", 2).join(" > "),
								},
							];

				if (!isAbsoluteUrl(node.destination)) {
					const match = resolveSlugToFile(node.destination, all);
					if (match) {
						const [pf, anchor] = match;
						resolved = relative(dirname(vf.data.file.slug), pf.slug) + anchor;
						if (node.type === "wikilink" && pf.data) {
							if (anchor === "") {
								if (typeof pf.data.mathLink === "string")
									children = extractPhrasing(mathLinkPipeline.parse(String(pf.data.mathLink)));
							} else {
								const blockId = node.destination.match(blockAnchorRegex);
								if (
									blockId &&
									typeof pf.data["mathLink-blocks"] === "object" &&
									typeof pf.data["mathLink-blocks"][blockId[1]] === "string"
								)
									children = extractPhrasing(
										mathLinkPipeline.parse(pf.data["mathLink-blocks"][blockId[1]]),
									);
							}
						}
					}
				}

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

				let resolved = node.destination;

				if (!isAbsoluteUrl(node.destination)) {
					const match = resolveSlugToFile(node.destination, all);
					if (match) {
						const [pf, anchor] = match;
						resolved = relative(dirname(vf.data.file.slug), pf.slug) + anchor;
					}
				}

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

export function createHtmlProcessor({
	macros,
}: {
	macros: Macros;
}): Processor<undefined, MdRoot, HtmlRoot> {
	return unified().use(remarkRehype, { allowDangerousHtml: true }).use(rehypeSlug).use(
		rehypeMathJaxSvg,
		// @ts-ignore don't really know why
		{
			tex: { macros },
		},
	);
}
