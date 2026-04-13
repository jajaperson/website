import type { FunctionComponent } from "preact";
// @ts-ignore
import calloutScript from "./scripts/callout.inline.js";
import { Script } from "./Script.js";

export const Article: FunctionComponent = ({ children }) => {
	return (
		<>
			<article class="prose my-8 mx-auto">{children}</article>
			<Script code={calloutScript} />
		</>
	);
};
