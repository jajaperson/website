/**
 * Based on <https://github.com/jackyzha0/quartz/blob/v4/quartz/util/jsx.tsx>
 */

import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Root } from "hast";
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";

export function htmlToJsx(tree: Root) {
	return toJsxRuntime(tree, {
		Fragment,
		jsx,
		jsxs,
		elementAttributeNameCase: "html",
	});
}
