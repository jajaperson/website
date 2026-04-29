import type { FunctionComponent } from "preact";
import { Page } from "./Page.js";
import { Article } from "../Article.js";
import { ProcessedFile } from "../../emitters.js";
import { Root as MdRoot } from "mdast";

export const ContentPage: FunctionComponent<{ file: ProcessedFile<MdRoot> }> = ({
	children,
	file,
}) => {
	const scripts = Object.values(file.data?.scripts ?? {});

	return (
		<Page title={file.data?.title!} scripts={scripts}>
			<Article>{children}</Article>
		</Page>
	);
};
