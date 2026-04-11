import type { VNode } from "preact";
import { render } from "preact-render-to-string";

export function renderJsx(jsx: VNode): string {
	return "<!DOCTYPE html>\n" + render(jsx);
}
