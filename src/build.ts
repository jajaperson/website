import { spawn } from "child_process";
import { rm } from "fs/promises";

import { ok as assert } from "devlop";

import cfg from "../build.config.js";
import { Emitter, isDynamic, preprocessFiles } from "./emitters.js";
import { Argv, BuildCtx } from "./util/ctx.js";
import { glob } from "./util/glob.js";
import { PerfTimer } from "./util/perf.js";

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
	const all = await Array.fromAsync(
		preprocessFiles(ctx, glob("**/*", cfg.vault, cfg.ignorePatterns)),
	);
	console.log(`Preprocessed ${all.length} files for output in ${perf.timeSince("preprocess")}`);

	perf.addEvent("renderInit");
	await Promise.all(
		ctx.emitterKeys.map(async (k) => {
			const emitter = ctx.emitters[k];
			if ("preRender" in emitter) await emitter.preRender(ctx, all);
		}),
	);
	console.log(`Initialized renderers in ${perf.timeSince("renderInit")}`);

	perf.addEvent("parseRender");
	for (const file of all) {
		const emitter = ctx.emitters[file.emitter];
		assert(isDynamic(emitter), "expected dynamic emitter");

		const out = await emitter.render(ctx, file, all);
		console.log(out);
	}
	console.log(`Parsed and rendered dynamic output in ${perf.timeSince("renderInit")}`);
}
