/**
 * Based on <https://github.com/jackyzha0/quartz/blob/v4/quartz/util/jsx.tsx>
 */

import { Components, toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Root } from "hast";
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
import type { VNode } from "preact";
import { render } from "preact-render-to-string";
import { h } from "preact";

function childrenToString(children: unknown): string {
	if (typeof children === "string") return children;
	if (Array.isArray(children)) return children.map(childrenToString).join("");
	return String(children ?? "");
}

const customComponents: Components = {
	table: (props) => (
		<div class="table-container">
			<table {...props} />
		</div>
	),
	style: ({ children, ...rest }) =>
		h("style", { ...rest, dangerouslySetInnerHTML: { __html: childrenToString(children) } }),
	script: ({ children, ...rest }) =>
		h("script", { ...rest, dangerouslySetInnerHTML: { __html: childrenToString(children) } }),
};

export function htmlToJsx(tree: Root) {
	return toJsxRuntime(tree, {
		Fragment,
		jsx,
		jsxs,
		elementAttributeNameCase: "html",
		components: customComponents,
	});
}

export function renderJsx(jsx: VNode): string {
	return "<!DOCTYPE html>\n" + render(jsx);
}
