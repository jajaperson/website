import { ok as assert } from "devlop";
import { h } from "hastscript";
import isAbsoluteUrl from "is-absolute-url";
import type { Handler, Handlers } from "mdast-util-to-hast";
import type {
	AliasWikilink,
	AltWikilinkEmbed,
	Wikilink,
	WikilinkEmbed,
} from "mdast-util-wikilink-syntax";
import { wikilinkFromMarkdown } from "mdast-util-wikilink-syntax";
import { resolveSlugToFile, splitAnchor } from "./path.js";
import { dirname, relative } from "node:path/posix";
import type { Element } from "hast";
import type { Plugin } from "unified";
import { unified } from "unified";
import { wikilink } from "micromark-extension-wikilink-syntax";
import remarkParse from "remark-parse";
import remarkMath from "@jajaperson/remark-math";
import type { ProcessedFile } from "../emitters.js";

// ^\|([^\n])+\|\n(\|) -> matches the header row
// ( ?:?-{3,}:? ?\|)+  -> matches the header row separator
// (\|([^\n])+\|\n)+   -> matches the body rows
const tableRegex = new RegExp(/^\|([^\n])+\|\n(\|)( ?:?-{3,}:? ?\|)+\n(\|([^\n])+\|\n?)+/gm);

export function wikilinkParse(): Plugin {
	return function () {
		const data = this.data();

		const micromarkExtensions = (data.micromarkExtensions ??= []);
		const fromMarkdownExtensions = (data.fromMarkdownExtensions ??= []);

		micromarkExtensions.push(wikilink({ gfmCompat: true }));
		fromMarkdownExtensions.push(wikilinkFromMarkdown());
	};
}

export function wikilinkHandlers(all: ProcessedFile<any>[]): Handlers {
	const mathLinkPipeline = unified().use(remarkParse).use(remarkMath);

	return {
		wikilink: handleWikilink(false),
		aliasWikilink: handleWikilink(true),
		wikilinkEmbed: handleWikilinkEmbed(false),
		altWikilinkEmbed: handleWikilinkEmbed(true),
	};

	function handleWikilink(alias: boolean): Handler {
		return function (state, node: Wikilink | AliasWikilink) {
			const current = state.options.file?.data.file;
			assert(current, "expected ProcessedFile in data");
			const curSlug = current.slug;

			if (!isAbsoluteUrl(node.destination)) {
				const [target, anchor, rawAnchor] = splitAnchor(node.destination);
				const isToBlock = typeof rawAnchor === "string" && rawAnchor.startsWith("^");
				// bodge
				const trueAnchor = isToBlock ? "#" + rawAnchor : anchor;

				const pf = target ? resolveSlugToFile(target, all) : state.options.file?.data.file;
				if (pf) {
					const resolved = target ? relative(dirname(curSlug), pf.slug) + trueAnchor : trueAnchor;
					if (alias) {
						return h("a", { href: resolved }, state.all(node));
					} else {
						if (pf.data) {
							if (rawAnchor === "" && typeof pf.data.mathLink === "string") {
								return h(
									"a",
									{ href: resolved },
									state.all(mathLinkPipeline.parse(pf.data.mathLink).children[0]),
								);
							} else if (isToBlock) {
								const blockId = rawAnchor.slice(1);
								if (
									typeof pf.data["mathLink-blocks"] === "object" &&
									typeof pf.data["mathLink-blocks"][blockId] === "string"
								) {
									return h(
										"a",
										{ href: resolved },
										state.all(
											mathLinkPipeline.parse(pf.data["mathLink-blocks"][blockId]).children[0],
										),
									);
								}
							}
						}

						// Fallback for non-broken, non-aliased links
						return h("a", { href: resolved }, rawAnchor || node.destination);
					}
				} else {
					return h(
						"a",
						{ href: node.destination, class: "broken" },
						alias ? state.all(node) : rawAnchor || node.destination,
					);
				}
			} else {
				return h(
					"a",
					{ href: node.destination, class: "external" },
					alias ? state.all(node) : node.destination,
				);
			}
		};
	}

	function handleWikilinkEmbed(alias: boolean): Handler {
		return function (state, node: WikilinkEmbed | AltWikilinkEmbed): Element {
			const curSlug = state.options.file?.data.file?.slug;
			assert(typeof curSlug === "string", "expected ProcessedFile in data");

			let resolved = node.destination;
			if (!isAbsoluteUrl(resolved)) {
				const [target, anchor, rawAnchor] = splitAnchor(node.destination);
				const pf = resolveSlugToFile(target, all);
				if (pf) {
					resolved = relative(dirname(curSlug), pf.slug) + anchor;
					if (pf.origin?.endsWith("md")) {
						return h(
							"blockquote",
							"Transclusion of ",
							h("a", { href: resolved }, rawAnchor || node.destination),
						);
					}
				}
			}

			let alt: string | undefined = undefined;
			let width: string | undefined = undefined;
			let height: string | undefined = undefined;
			if (alias) {
				assert(node.type === "altWikilinkEmbed", "expected altWikiLink");
				alt = node.alt.replace(/(?:^|\|) *(\d+) *(?:x *(\d+) *)?$/, (_, $1, $2) => {
					width = $1;
					height = $1;
					return "";
				});
			}

			return h("img", { src: resolved, alt, width, height });
		};
	}
}
