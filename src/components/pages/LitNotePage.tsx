import { CSLEntry } from "biblatex-csl-converter";
import { FunctionComponent } from "preact";
import { Page } from "./Page.js";
import { Article } from "../Article.js";

export interface CSLAuthor {
	given: string;
	family: string;
}

export const LitNotePage: FunctionComponent<{ entry: CSLEntry }> = ({ entry }) => {
	const title = typeof entry.title === "string" ? entry.title : "Untitled";
	const authors: CSLAuthor[] = Array.isArray(entry.author) ? entry.author : [];

	const Authors = () => <p>{authors.map((a) => `${a.given} ${a.family}`).join(" • ")}</p>;
	const Title = () => <h1 dangerouslySetInnerHTML={{ __html: title }} />;
	const Ident = () =>
		typeof entry.DOI === "string" ? (
			<a href={`https://doi.org/${entry.DOI}`}>{entry.DOI}</a>
		) : typeof entry.ISBN === "string" ? (
			<a
				href={
					typeof entry.URL === "string"
						? entry.URL
						: `https://en.wikipedia.org/wiki/Special:BookSources/${entry.ISBN.split(" ")[0]}`
				}
			>
				{entry.ISBN.split(" ")[0]}
			</a>
		) : typeof entry.URL === "string" ? (
			<a href={entry.URL} class="external">
				{entry.URL}
			</a>
		) : null;
	const Container = () =>
		typeof entry["container-title"] === "string" ? (
			<p>
				in <em dangerouslySetInnerHTML={{ __html: entry["container-title"] }}></em>
			</p>
		) : null;
	const Abstract = () =>
		typeof entry.abstract === "string" ? (
			<blockquote class="callout abstract" data-callout="abstract">
				<div class="callout-title">
					<div class="callout-icon" />
					<div class="callout-title-inner">
						<p>Abstract</p>
					</div>
				</div>
				<div class="callout-content">
					<p dangerouslySetInnerHTML={{ __html: entry.abstract }} />
				</div>
			</blockquote>
		) : null;

	return (
		<Page>
			<Article>
				<Authors />
				<Title />
				<Ident />
				<Container />
				<Abstract />
			</Article>
		</Page>
	);
};
