import { readFileSync } from "node:fs";
import { Content } from "./src/emmitters/Content.js";
import { LitNotes } from "./src/emmitters/LitNotes.js";

import { BuildConfig } from "./src/types.js";
import { Attachments } from "./src/emmitters/Attachments.js";
// import { Pages } from "./src/emmitters/Pages.js";

export default {
	vault: "vault",
	ignorePatterns: ["private", "templates", ".obsidian"],
	emitters: [
		// new Pages(),
		new Content(readFileSync("vault/preamble.sty", "utf8")),
		new LitNotes(),
		new Attachments("Bins/Attachments/"),
	],
} satisfies BuildConfig;
