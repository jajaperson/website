import { Root as MdRoot } from "mdast";
import type { FunctionComponent } from "preact";

import { PreprocessedFile } from "../../emitters.js";
import { Article } from "../Article.js";
import { Page } from "./Page.js";

export const ContentPage: FunctionComponent<{ file: PreprocessedFile<MdRoot> }> = ({
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
