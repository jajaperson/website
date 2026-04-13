#!/usr/bin/env -S node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import esbuild from "esbuild";
import { styleText } from "util";
// import { Mutex } from "async-mutex";
import { randomUUID } from "crypto";
import { BUILD, CACHE_FILE } from "./constants.mjs";
import { readFile } from "fs/promises";
import { dirname, relative, resolve } from "path";

/** @import {Argv} from "../src/util/ctx.js" */

/** @satisfies {Argv} */
const argv = await yargs(hideBin(process.argv))
	.scriptName("build")
	.usage("$0 [args]")
	.option("output", {
		type: "string",
		alias: ["o"],
		default: "public",
		describe: "output folder for files",
	})
	.option("watch", {
		type: "boolean",
		default: false,
		describe: "watch for changes and rebuild automatically",
	})
	.option("serve", {
		boolean: true,
		default: false,
		describe: "run a local server to live-preview",
	})
	.option("port", {
		type: "number",
		default: 8080,
		describe: "port to serve on",
	})
	.option("wsPort", {
		type: "number",
		default: 3001,
		describe: "port for live reload via websockets",
	})
	.option("concurrency", {
		type: "number",
		default: 1,
		describe: "number of threads to use",
	})
	.help()
	.strict()
	.parseAsync();

if (argv.serve) argv.watch = true;

const ctx = await esbuild.context({
	entryPoints: [BUILD],
	outfile: CACHE_FILE,
	bundle: true,
	keepNames: true,
	minifyWhitespace: true,
	minifySyntax: true,
	platform: "node",
	format: "esm",
	jsx: "automatic",
	jsxImportSource: "preact",
	packages: "external",
	metafile: true,
	sourcemap: true,
	sourcesContent: false,
	plugins: [
		{
			name: "inline-script-loader",
			setup(build) {
				build.onLoad({ filter: /\.inline\.(ts|js)$/ }, async (args) => {
					let text = await readFile(args.path, "utf8");

					// remove default exports that we manually inserted
					text = text.replace("export default", "");
					text = text.replace("export", "");

					const sourcefile = relative(resolve("."), args.path);
					const resolveDir = dirname(sourcefile);
					const transpiled = await esbuild.build({
						stdin: {
							contents: text,
							loader: "ts",
							resolveDir,
							sourcefile,
						},
						write: false,
						bundle: true,
						minify: true,
						platform: "browser",
						format: "esm",
					});
					const rawMod = transpiled.outputFiles[0].text;
					return {
						contents: rawMod,
						loader: "text",
					};
				});
			},
		},
	],
});

// const buildMutex = new Mutex();

async function build() {
	// const release = await buildMutex.acquire();

	await ctx.rebuild().catch((err) => {
		console.error(`${styleText("red", "Couldn't parse:")} ${BUILD}`);
		console.log(`Reason: ${styleText("gray", err)}`);
		process.exit(1);
	});
	// release();

	// bypass module cache
	// https://github.com/nodejs/modules/issues/307
	const { default: build } = await import(`../${CACHE_FILE}?update=${randomUUID()}`);
	// ^ this import is relative, so base "cacheFile" path can't be used

	await build(argv);
}

await build();
ctx.dispose();
