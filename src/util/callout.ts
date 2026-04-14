import { Element, ElementContent } from "hast";
import { h } from "hastscript";
import { calloutFromMarkdown } from "mdast-util-callout";
import type { CalloutTitle, CalloutContent, Callout } from "mdast-util-callout";
import { Handlers } from "mdast-util-to-hast";
import { calloutExt } from "micromark-extension-callout";
import { Plugin } from "unified";

// @ts-ignore
// import calloutScript from "../components/scripts/callout.inline.js";

const calloutMapping = {
	note: "note",
	abstract: "abstract",
	summary: "abstract",
	tldr: "abstract",
	info: "info",
	todo: "todo",
	tip: "tip",
	hint: "tip",
	important: "tip",
	success: "success",
	check: "success",
	done: "success",
	question: "question",
	help: "question",
	faq: "question",
	warning: "warning",
	attention: "warning",
	caution: "warning",
	failure: "failure",
	missing: "failure",
	fail: "failure",
	danger: "danger",
	error: "danger",
	bug: "bug",
	example: "example",
	quote: "quote",
	cite: "quote",
} as const;

function canonicalizeCallout(calloutName: string): keyof typeof calloutMapping {
	const normalizedCallout = calloutName.toLowerCase() as keyof typeof calloutMapping;
	// if callout is not recognized, make it a custom one
	return calloutMapping[normalizedCallout] ?? calloutName;
}

export function calloutParse(): Plugin {
	return function () {
		const data = this.data();

		const micromarkExtensions = (data.micromarkExtensions ??= []);
		const fromMarkdownExtensions = (data.fromMarkdownExtensions ??= []);

		micromarkExtensions.push(calloutExt());
		fromMarkdownExtensions.push(calloutFromMarkdown());
	};
}

export function calloutHandlers(): Handlers {
	return {
		callout(state, node: Callout) {
			// const file = state.options.file?.data.file;
			// assert(file, "expected file");
			// ((file.data ??= {}).scripts ??= {}).callout ??= calloutScript;

			const type = canonicalizeCallout(node.calloutType);
			const { collapse, titled } = node;
			const collapsible = collapse === "closed" || collapse === "open";
			const initOpen = collapse === "open";

			const classes = ["callout", type];

			if (collapsible) classes.push("is-collapsible");

			return h(
				collapsible ? "details" : "div",
				{
					class: classes.join(" "),
					"data-callout": type,
					open: collapsible && initOpen,
				},
				titled ? null : calloutTitle(h("span", { class: "callout-type" }, node.calloutType)),
				state.all(node),
			);
		},
		calloutTitle(state, node: CalloutTitle) {
			return calloutTitle(...state.all(node));
		},
		calloutContent(state, node: CalloutContent) {
			return h("div", { class: "callout-content" }, state.all(node));
		},
	};

	function calloutTitle(...title: ElementContent[]): Element {
		return h(
			"summary",
			{ class: "callout-title" },
			h("div", { class: "callout-icon" }),
			h("div", { class: "callout-title-inner" }, title),
			h("div", { class: "fold-callout-icon" }),
		);
	}
}
