function toggleCallout(this: HTMLElement) {
	const outerBlock = this.parentElement!;
	const collapsed = outerBlock.classList.toggle("is-collapsed");
	const content = outerBlock.getElementsByClassName("callout-content")[0] as HTMLElement;
	if (!content) return;
	content.style.gridTemplateRows = collapsed ? "0fr" : "1fr";
}

function setupCallout() {
	const abort = new AbortController();
	const { signal } = abort;

	const collapsible = document.getElementsByClassName(
		`callout is-collapsible`,
	) as HTMLCollectionOf<HTMLElement>;
	for (const div of collapsible) {
		const title = div.getElementsByClassName("callout-title")[0] as HTMLElement;
		const content = div.getElementsByClassName("callout-content")[0] as HTMLElement;
		if (!title || !content) continue;

		title.addEventListener("click", toggleCallout, { signal });

		const collapsed = div.classList.contains("is-collapsed");
		content.style.gridTemplateRows = collapsed ? "0fr" : "1fr";
	}
}

document.addEventListener("DOMContentLoaded", setupCallout);
