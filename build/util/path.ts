/**
 * Based on <https://github.com/jackyzha0/quartz/blob/v4/quartz/util/path.ts>
 */

/** Utility for constructing branded aliases of `string` */
type SlugLike<T> = string & { __brand: T };

/** Path to a file in the vault. Not relative. */
export type VaultPath = SlugLike<"vaultPath">;
export function isAbsolutePath(s: string): s is VaultPath {
	return !s.startsWith(".");
}

/** Slug for website. */
export type FullSlug = SlugLike<"full">;
export function isFullSlug(s: string): s is FullSlug {
	const validStart = !(s.startsWith(".") || s.startsWith("/"));
	const validEnding = !s.endsWith("/");
	return validStart && validEnding && !containsForbiddenCharacters(s);
}

function containsForbiddenCharacters(s: string): boolean {
	return s.includes(" ") || s.includes("#") || s.includes("?") || s.includes("&");
}

/**
 * Strips trailing slashes from a path string/
 *
 * @param s string to strip slashes from
 * @param onlyStripPrefix if `true`, terminal `/` is retained
 * @returns string with slashes stripped
 */
export function stripSlashes(s: string, onlyStripPrefix?: boolean): string {
	if (s.startsWith("/")) {
		s = s.substring(1);
	}

	if (!onlyStripPrefix && s.endsWith("/")) {
		s = s.slice(0, -1);
	}

	return s;
}

function sluggify(s: string): string {
	return s
		.split("/")
		.map((segment) =>
			segment
				.replace(/\s/g, "-")
				.replace(/&/g, "-and-")
				.replace(/%/g, "-percent")
				.replace(/\?/g, "")
				.replace(/#/g, "-tag-"),
		)
		.join("/") // always use / as sep
		.replace(/\/$/, "");
}

/**
 * Get the website slug corresponding to a path in the vault
 *
 * @param fp path in vault to sluggify
 * @param excludeExt if `true`, the resultant slug will not have an extensions
 * @returns slug
 */
export function sluggifyVaultPath(fp: VaultPath, excludeExt?: boolean): FullSlug {
	fp = stripSlashes(fp) as VaultPath;
	let ext = getFileExtension(fp);
	const withoutFileExt = fp.replace(new RegExp(ext + "$"), "");
	if (excludeExt || [".md", ".html", undefined].includes(ext)) {
		ext = "";
	}

	let slug = sluggify(withoutFileExt);

	return (slug + ext) as FullSlug;
}

export function getFileExtension(s: string): string | undefined {
	return s.match(/\.[A-Za-z0-9]+$/)?.[0];
}
