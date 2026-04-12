import type { FunctionComponent } from "preact";
import { Page } from "./Page.js";

export const ContentPage: FunctionComponent = ({ children }) => (
	<Page>
		<article class="prose m-8">{children}</article>
	</Page>
);
