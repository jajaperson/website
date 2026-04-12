import type { Plugin, Processor } from "unified";
import { unified } from "unified";
import { resolveSlugToFile, splitAnchor } from "./path.js";
import remarkParse from "remark-parse";
import remarkMath from "@jajaperson/remark-math";
import remarkGfm from "remark-gfm";
import remarkInlineFootnote from "remark-inline-footnote";
import rehypeMathJaxSvg from "@jajaperson/rehype-mathjax/svg";
import rehypeStarryNight from "rehype-starry-night";
import { ok as assert } from "devlop";
import type { PhrasingContent, Root as MdRoot } from "mdast";
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
import { ElementContent, Root as HtmlRoot } from "hast";
import { ProcessedFile } from "../emitters.js";
import { dirname, relative } from "node:path/posix";
import { Handler, Handlers } from "mdast-util-to-hast";
import { all as allGrammars } from "@wooorm/starry-night";
import { rehypeBlockId, remarkBlockId } from "remark-rehype-block-id";

export function createMdProcessor(): Processor<MdRoot, MdRoot, MdRoot> {
	return unified()
		.use(remarkParse)
		.use(remarkMath)
		.use(remarkGfm)
		.use(remarkInlineFootnote)
		.use(remarkBlockId)
		.use(wikilinkParse()) as unknown as Processor<MdRoot, MdRoot, MdRoot>;
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

function wikilinkParse(): Plugin {
	return function () {
		const data = this.data();

		const micromarkExtensions = (data.micromarkExtensions ??= []);
		const fromMarkdownExtensions = (data.fromMarkdownExtensions ??= []);

		micromarkExtensions.push(wikilink());
		fromMarkdownExtensions.push(wikilinkFromMarkdown());
	};
}

function wikilinkHandlers(all: ProcessedFile<any>[]): Handlers {
	const mathLinkPipeline = unified().use(remarkParse).use(remarkMath);

	return {
		wikilink: handleWikilink(false),
		aliasWikilink: handleWikilink(true),
		wikilinkEmbed: handleWikilinkEmbed(false),
		altWikilinkEmbed: handleWikilinkEmbed(true),
	};

	function handleWikilink(alias: boolean): Handler {
		return function (state, node: Wikilink | AliasWikilink): ElementContent {
			const current = state.options.file?.data.file;
			assert(current, "expected ProcessedFile in data");
			const curSlug = current.slug;

			if (!isAbsoluteUrl(node.destination)) {
				const [target, anchor, rawAnchor] = splitAnchor(node.destination);
				const isToBlock = typeof rawAnchor === "string" && rawAnchor.startsWith("^");
				// bodge
				const trueAnchor = isToBlock ? anchor : "#" + rawAnchor;

				const pf = target ? resolveSlugToFile(target, all) : state.options.file?.data.file;
				if (pf) {
					const resolved = target ? relative(dirname(curSlug), pf.slug) + trueAnchor : trueAnchor;
					if (alias) {
						return {
							type: "element",
							tagName: "a",
							properties: { href: resolved },
							children: state.all(node),
						};
					} else {
						if (pf.data) {
							if (rawAnchor === "" && typeof pf.data.mathLink === "string") {
								return {
									type: "element",
									tagName: "a",
									properties: { href: resolved },
									children: state.all(mathLinkPipeline.parse(pf.data.mathLink).children[0]),
								};
							} else if (isToBlock) {
								const blockId = rawAnchor.slice(1);
								if (
									typeof pf.data["mathLink-blocks"] === "object" &&
									typeof pf.data["mathLink-blocks"][blockId] === "string"
								) {
									return {
										type: "element",
										tagName: "a",
										properties: { href: resolved },
										children: state.all(
											mathLinkPipeline.parse(pf.data["mathLink-blocks"][blockId]).children[0],
										),
									};
								}
							}
						}

						// Fallback for non-broken, non-aliased links
						return {
							type: "element",
							tagName: "a",
							properties: { href: resolved },
							children: [
								{
									type: "text",
									value: rawAnchor || node.destination,
								},
							],
						};
					}
				} else {
					return {
						type: "element",
						tagName: "a",
						properties: { href: node.destination, class: "broken" },
						children: alias
							? state.all(node)
							: [
									{
										type: "text",
										value: rawAnchor || node.destination,
									},
								],
					};
				}
			} else {
				return {
					type: "element",
					tagName: "a",
					properties: { href: node.destination },
					children: alias
						? state.all(node)
						: [
								{
									type: "text",
									value: node.destination,
								},
							],
				};
			}
		};
	}

	function handleWikilinkEmbed(alias: boolean): Handler {
		return function (state, node: WikilinkEmbed | AltWikilinkEmbed): ElementContent {
			const curSlug = state.options.file?.data.file?.slug;
			assert(typeof curSlug === "string", "expected ProcessedFile in data");

			let resolved = node.destination;
			if (!isAbsoluteUrl(resolved)) {
				const [target, anchor, rawAnchor] = splitAnchor(node.destination);
				const pf = resolveSlugToFile(target, all);
				if (pf) resolved = relative(dirname(curSlug), pf.slug) + anchor;
			}

			let alt: string | undefined = undefined;
			if (alias) {
				assert(node.type === "altWikilinkEmbed", "expected altWikiLink");
				alt = node.alt;
			}

			return {
				type: "element",
				tagName: "img",
				properties: { src: resolved, alt },
				children: [],
			};
		};
	}
}

export function createHtmlProcessor(
	all: ProcessedFile<any>[],
	{
		macros,
	}: {
		macros: Macros;
	},
): Processor<undefined, MdRoot, HtmlRoot> {
	return unified()
		.use(remarkRehype, {
			allowDangerousHtml: true,
			handlers: wikilinkHandlers(all),
			passThrough: ["blockId"],
		})
		.use(rehypeBlockId)
		.use(rehypeSlug)
		.use(
			rehypeMathJaxSvg,
			// @ts-ignore don't really know why
			{
				tex: { macros },
			},
		)
		.use(rehypeStarryNight, { grammars: allGrammars });
}
