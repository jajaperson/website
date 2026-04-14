import type { Processor } from "unified";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "@jajaperson/remark-math";
import remarkGfm from "remark-gfm";
import remarkInlineFootnote from "remark-inline-footnote";
import rehypeMathJaxSvg from "@jajaperson/rehype-mathjax/svg";
import rehypeStarryNight from "rehype-starry-night";
import rehypeRaw from "rehype-raw";
import type { Root as MdRoot } from "mdast";
import { Macros } from "./loadPreamble.js";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import { Root as HtmlRoot } from "hast";
import { ProcessedFile } from "../emitters.js";
import { all as allGrammars } from "@wooorm/starry-night";
import { rehypeBlockId, remarkBlockId } from "remark-rehype-block-id";
import { wikilinkHandlers, wikilinkParse } from "./wikilink.js";
import { calloutHandlers, calloutParse } from "./callout.js";
import { hashtagHandlers, hashtagParse } from "./hashtag.js";

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
			handlers: { ...hashtagHandlers(), ...wikilinkHandlers(all), ...calloutHandlers() },
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
		.use(rehypeStarryNight, { grammars: allGrammars })
		.use(rehypeRaw);
}
