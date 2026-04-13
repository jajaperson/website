import type { FunctionComponent } from "preact";
import { Page } from "./Page.js";
import { Article } from "../Article.js";

export const ContentPage: FunctionComponent<{ title: string }> = ({ children, title }) => (
	<Page title={title}>
		<Article>{children}</Article>
	</Page>
);
