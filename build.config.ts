import { readFileSync } from "node:fs";
import { ContentPage } from "./src/emmitters/Content.js";
import { LitNotes } from "./src/emmitters/LitNotes.js";

import { BuildConfig } from "./src/types.js";

export default {
	vault: "vault",
	ignorePatterns: ["private", "templates", ".obsidian"],
	emitters: [new ContentPage(readFileSync("vault/preamble.sty", "utf8")), new LitNotes()],
} satisfies BuildConfig;
