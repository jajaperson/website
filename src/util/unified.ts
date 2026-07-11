import rehypeMathJaxChtml from "@jajaperson/rehype-mathjax/chtml";
import remarkMath from "@jajaperson/remark-math";
import { all as allGrammars } from "@wooorm/starry-night";
import { Root as HtmlRoot } from "hast";
import type { Root as MdRoot } from "mdast";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStarryNight from "rehype-starry-night";
import remarkGfm from "remark-gfm";
import remarkInlineFootnote from "remark-inline-footnote";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { rehypeBlockId, remarkBlockId } from "remark-rehype-block-id";
import type { Processor } from "unified";
import { unified } from "unified";

import { PreprocessedFile } from "../emitters.js";
import { calloutHandlers, calloutParse } from "./callout.js";
import { hashtagHandlers, hashtagParse } from "./hashtag.js";
import { Macros } from "./loadPreamble.js";
import { mermaidVisit } from "./mermaid.js";
import { wikilinkHandlers, wikilinkParse } from "./wikilink.js";

export function createMdProcessor(): Processor<MdRoot, MdRoot, MdRoot> {
	return unified()
		.use(remarkParse)
		.use(remarkMath)
		.use(remarkGfm)
		.use(remarkInlineFootnote)
		.use(remarkBlockId)
		.use(hashtagParse())
		.use(wikilinkParse())
		.use(calloutParse()) as unknown as Processor<MdRoot, MdRoot, MdRoot>;
}

export function createHtmlProcessor(
	all: PreprocessedFile[],
	{
		macros,
	}: {
		macros: Macros;
	},
): Processor<undefined, MdRoot, HtmlRoot> {
	return unified()
		.use(remarkRehype, {
			allowDangerousHtml: true,
			handlers: { ...hashtagHandlers(), ...wikilinkHandlers(all), ...calloutHandlers() },
			passThrough: ["blockId"],
		})
		.use(rehypeBlockId)
		.use(rehypeSlug)
		.use(
			rehypeMathJaxChtml,
			// @ts-ignore don't really know why
			{
				tex: { macros },
				chtml: {
					fontURL: "https://cdn.jsdelivr.net/npm/@mathjax/mathjax-newcm-font/chtml/woff2",
				},
			},
		)
		.use(rehypeStarryNight, {
			grammars: allGrammars,
			plainText: ["mermaid", "dataview", "BlooP", "FlooP"],
		})
		.use(mermaidVisit())
		.use(rehypeRaw);
}
