// import { Mutex } from "async-mutex";
import { rm } from "fs/promises";
import { Argv, BuildCtx } from "./util/ctx.js";
import { PerfTimer } from "./util/perf.js";
import { spawn } from "child_process";
import cfg from "../build.config.js";
import { glob } from "./util/glob.js";
import { Emitter, parseFiles, preprocessFiles, renderFiles } from "./emitters.js";

export default async function (argv: Argv) {
	const perf = new PerfTimer();

	const emitters: { [key: symbol]: Emitter } = {};
	const emitterKeys: symbol[] = [];
	for (const emitter of cfg.emitters) {
		emitters[emitter.symbol] = emitter;
		emitterKeys.push(emitter.symbol);
	}
	console.log(`Loaded ${emitterKeys.length} emitters`);

	const ctx: BuildCtx = {
		argv,
		cfg,
		emitters,
		emitterKeys,
	};

	// const release = await mtx.acquire();

	perf.addEvent("clean");
	await rm(argv.output, { recursive: true, force: true });
	console.log(`Cleaned output directory \`${argv.output}\` in ${perf.timeSince("clean")}`);

	perf.addEvent("postcss");
	spawn(
		"pnpm",
		[
			"postcss",
			"src/styles.css",
			"-o",
			`${argv.output}/styles.css`,
			...(argv.watch ? ["--watch"] : []),
		],
		{ stdio: "inherit" },
	).on("close", (code) => {
		if (code === 0) console.log(`PostCSS success in ${perf.timeSince("postcss")}`);
		else console.log(`PostCSS failure in ${perf.timeSince("postcss")}`);
	});

	perf.addEvent("preprocess");

	// We use an unsugared `.then` chain so that the arrays don't hang around
	// after each step
	await Array.fromAsync(preprocessFiles(ctx, glob("**/*", cfg.vault, cfg.ignorePatterns)))
		.then(async (preprocessed) => {
			console.log(
				`Preprocessed ${preprocessed.length} files for output in ${perf.timeSince("preprocess")}`,
			);

			perf.addEvent("parse");

			return Array.fromAsync(parseFiles(ctx, preprocessed));
		})
		.then((parsed) => {
			console.log(`Parsed ${parsed.length} files in ${perf.timeSince("parse")}`);

			perf.addEvent("render");
			return Array.fromAsync(renderFiles(ctx, parsed));
		})
		.then((slugs) => {
			console.log(
				`Rendered ${slugs.length} files to ${ctx.argv.output} in ${perf.timeSince("render")}`,
			);
		});
}
