import type { FunctionComponent } from "preact";
import { Page } from "./Page.js";
import { Article } from "../Article.js";
import { ProcessedFile } from "../../emitters.js";
import { Root as MdRoot } from "mdast";

export const ContentPage: FunctionComponent<{ fileData: ProcessedFile<MdRoot>["data"] }> = ({
	children,
	fileData,
}) => (
	<Page title={fileData?.data?.title} scripts={Object.values(fileData?.scripts ?? {})}>
		<Article>{children}</Article>
	</Page>
);
