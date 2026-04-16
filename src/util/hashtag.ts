import type { Plugin } from "unified";
import { hashtag } from "micromark-extension-hashtag";
import { Hashtag, hashtagFromMarkdown } from "mdast-util-hashtag";
import { Handlers } from "mdast-util-to-hast";
import { codes } from "micromark-util-symbol";
import { unicodePunctuation, unicodeWhitespace } from "micromark-util-character";
import { h } from "hastscript";

export function hashtagParse(): Plugin {
	return function () {
		const data = this.data();

		const micromarkExtensions = (data.micromarkExtensions ??= []);
		const fromMarkdownExtensions = (data.fromMarkdownExtensions ??= []);

		micromarkExtensions.push(
			hashtag(
				(code) =>
					!(unicodeWhitespace(code) || unicodePunctuation(code)) ||
					code === codes.slash ||
					code === codes.underscore ||
					code === codes.dash,
			),
		);
		fromMarkdownExtensions.push(hashtagFromMarkdown());
	};
}

export function hashtagHandlers(): Handlers {
	return {
		// for now we just remove them
		hashtag: (_, { value }: Hashtag) => h("span", { class: "hashtag" }, "#" + value),
	};
}
