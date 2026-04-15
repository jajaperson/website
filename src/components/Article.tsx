import type { FunctionComponent } from "preact";

export const Article: FunctionComponent = ({ children }) => {
	return (
		<>
			<article class="prose p-8 mx-auto">{children}</article>
		</>
	);
};
