/**
 * Based on <https://github.com/jackyzha0/quartz/blob/v4/quartz/util/path.ts>
 */

import { slug as slugAnchor } from "github-slugger";
import { dirname, relative } from "node:path/posix";
import { ProcessedFile } from "../emitters.js";

/** Utility for constructing branded aliases of `string` */
type SlugLike<T> = string & { __brand: T };

/** Path to a file in the vault. */
export type VaultPath = SlugLike<"vaultPath">;
export function isVaultPath(s: string): s is VaultPath {
	return !s.startsWith(".");
}

/** The same, but for a file anywhere, */
export type FilePath = SlugLike<"repoPath">;
export function isFilePath(s: string): s is FilePath {
	return !s.startsWith(".");
}

/** Slug for website. */
export type FullSlug = SlugLike<"full">;
export function isFullSlug(s: string): s is FullSlug {
	const validStart = !(s.startsWith(".") || s.startsWith("/"));
	const validEnding = !s.endsWith("/");
	return validStart && validEnding && !containsForbiddenCharacters(s);
}

/** Can be found on `href`s but can also be constructed for client-side navigation (e.g. search and graph) */
export type RelativeURL = SlugLike<"relative">;
export function isRelativeURL(s: string): s is RelativeURL {
	const validStart = /^\.{1,2}/.test(s);
	return validStart && ![".md", ".html"].includes(getFileExtension(s) ?? "");
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
		.replace(/\s/g, "-")
		.replace(/&/g, "et")
		.replace(/%/g, "-percent")
		.replace(/\?/g, "")
		.replace(/#/g, "tag-");
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

/**
 * Resolve a link using a stricter version of Obsidian in “shortest” mode.
 *
 * If there is an exact match (up to casefolding + normalization), we return
 * that. Otherwise we look for a path whose final segment(s) match. If there
 * are multiple matches... well then the vault author was irresponsible, and
 * we throw.
 *
 * @param target the target slug (without an anchor)
 * @param all files to search through
 * @param sluggifyDestination if true, the destination is sluggified before searching
 * @returns [matched file, normalized anchor, raw anchor]
 */
export function resolveSlugToFile<T>(
	target: string,
	all: Iterable<ProcessedFile<T>>,
	sluggifyDestination = true,
): ProcessedFile<T> | undefined {
	const targetCanonical = (sluggifyDestination ? sluggifyVaultPath(target as VaultPath) : target)
		.toLowerCase()
		.normalize("NFD");

	const matches: ProcessedFile<T>[] = [];

	for (const vf of all) {
		const slugCanonical = vf.slug.toLowerCase().normalize("NFD");
		if (slugCanonical === targetCanonical) return vf;
		if (slugCanonical.endsWith("/" + targetCanonical)) matches.push(vf);
	}
	if (matches.length === 1) return matches[0];
	else if (matches.length !== 0)
		throw new Error(
			`The slug \`${target}\` has multiple matches: ${matches.map((m) => `\`${m}\``).join(", ")}.`,
		);
}

/**
 * Split a link a link and a normalized anchor
 *
 * @param link link to split
 * @returns [path, #normalized anchor, raw anchor]
 */
export function splitAnchor(link: string): [string, string, string] {
	let [fp, anchor] = link.split("#", 2);
	// fp has no extension
	if (!/(\/|^)[^\/.]+\.[^\/]+$/.test(fp)) {
		return [fp, anchor ? "#" + slugAnchor(anchor) : "", anchor ?? ""];
	}
	return [fp, anchor ? "#" + anchor : "", anchor];
}
