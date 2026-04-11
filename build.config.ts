import { readFileSync } from "node:fs";
import { ContentPage } from "./emmitters/Content.js";
import { LitNotes } from "./emmitters/LitNotes.js";

import { BuildConfig } from "./src/types.js";

export default {
	vault: "vault",
	ignorePatterns: ["private", "templates", ".obsidian"],
	emitters: [new ContentPage(readFileSync("vault/preamble.sty", "utf8")), new LitNotes()],
} satisfies BuildConfig;
