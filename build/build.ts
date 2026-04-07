import { Mutex } from "async-mutex";
import { rm } from "fs/promises";
import { Argv, BuildCtx } from "./util/ctx.js";
import { PerfTimer } from "./util/perf.js";

import cfg from "../build.config.js";
import { glob } from "./util/glob.js";
import { preprocessFiles } from "./emitters.js";

export default async function (argv: Argv, mtx: Mutex) {
	const perf = new PerfTimer();

	const ctx: BuildCtx = {
		argv,
		cfg,
	};

	const release = await mtx.acquire();

	perf.addEvent("clean");
	await rm(argv.output, { recursive: true, force: true });
	console.log(`Cleaned output directory \`${argv.output}\` in ${perf.timeSince("clean")}`);

	perf.addEvent("preprocess");
	const fps = glob("**/*", cfg.vault, cfg.ignorePatterns);
	const preprocessed = await Array.fromAsync(preprocessFiles(ctx, fps));
	console.log(
		`Preprocessed ${preprocessed.length} files for output in ${perf.timeSince("preprocess")}`,
	);
}
