import type { FunctionComponent } from "preact";
import { Page } from "./Page.js";

export const ContentPage: FunctionComponent<{ title: string }> = ({ children, title }) => (
	<Page title={title}>
		<article class="prose m-8">{children}</article>
	</Page>
);
