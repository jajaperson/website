import { contentPage } from "./emmitters/content.js";
import { BuildConfig } from "./build/types.js";
import { litNotes } from "./emmitters/litNotes.js";

export default {
	vault: "vault",
	ignorePatterns: ["private", "templates", ".obsidian"],
	emitters: [contentPage, litNotes],
} satisfies BuildConfig;
