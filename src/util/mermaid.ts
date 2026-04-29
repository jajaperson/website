import { equal as assertEqual } from "devlop";
import { Element } from "hast";
import { Plugin } from "unified";
import { SKIP, visitParents } from "unist-util-visit-parents";
import { toText } from "hast-util-to-text";
import ClassList from "hast-util-class-list";
// @ts-ignore
import mermaid from "../components/scripts/mermaid.inline.js";

export function mermaidVisit(): Plugin {
	return function () {
		return function (tree, vf) {
			visitParents(
				tree,
				{ type: "element", tagName: "code" },
				(node: Element, ancestors: Element[]) => {
					assertEqual(node.tagName, "code");
					const codeClasses = ClassList(node);
					if (!codeClasses.contains("language-mermaid")) {
						return SKIP;
					}
					const parent = ancestors.at(-1);
					if (parent?.tagName !== "pre") {
						return SKIP;
					}
					const parentClasses = ClassList(parent);
					parentClasses.add("mermaid");

					const diagram = toText(node, { whitespace: "pre" });
					parent.children = [
						{
							type: "text",
							value: diagram,
						},
					];

					vf.data.file!.data ??= {};
					vf.data.file!.data.scripts ??= {};
					vf.data.file!.data.scripts.mermaid ??= mermaid;
				},
			);
		};
	};
}
