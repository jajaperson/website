import { ok as assert } from "devlop";
import { BuildCtx } from "./util/ctx.js";
import { FullSlug, FilePath, VaultPath } from "./util/path.js";
import { flatMap } from "iterable-utilities";

export type ProcessedFile<Content = string> = {
	/** Destination slug for this file once fully processed */
	slug: FullSlug;
	/** File in vault whence this file originated */
	origin?: VaultPath;
	data?: {
		[key: string]: any;
	};
	/** Symbol for the emitter responsible for this file. Should match `emitter.symbol`. */
	emitter: symbol;
} & (Content extends void
	? {}
	: {
			/** Processed content of the file */
			content: Content;
		});

declare module "vfile" {
	interface DataMap {
		file: ProcessedFile<any>;
	}
}

interface BaseEmitter {
	symbol: symbol;
}

interface StaticEmitter extends BaseEmitter {
	render: () => void;
}

export interface DynamicEmitter<
	PreContent = string,
	ParsedContent = PreContent,
> extends BaseEmitter {
	preProcess(ctx: BuildCtx, vp: VaultPath): AsyncIterable<ProcessedFile<PreContent>>;

	preParse?(ctx: BuildCtx, all: ProcessedFile<any>[]): Promise<void> | void;

	parse(
		ctx: BuildCtx,
		current: ProcessedFile<PreContent>,
		all: ProcessedFile<any>[],
	): AsyncIterable<ProcessedFile<ParsedContent>>;
	/** Should yield the slug for each emitted file */

	preRender?(ctx: BuildCtx, all: ProcessedFile<any>[]): Promise<void> | void;

	render(
		ctx: BuildCtx,
		current: ProcessedFile<ParsedContent>,
		all: ProcessedFile<any>[],
	): AsyncIterable<FilePath>;
}

export type Emitter = DynamicEmitter<any> | StaticEmitter;

export function isDynamic(emitter: Emitter): emitter is DynamicEmitter<any> {
	return "preProcess" in emitter;
}

export async function* preprocessFiles(
	ctx: BuildCtx,
	fps: AsyncIterable<VaultPath>,
): AsyncIterableIterator<ProcessedFile<any>> {
	for await (const fp of fps) {
		for (const key of ctx.emitterKeys) {
			const emitter = ctx.emitters[key];
			if (isDynamic(emitter))
				for await (const vf of emitter.preProcess(ctx, fp)) {
					yield vf;
				}
		}
	}
}

export async function* parseFiles(
	ctx: BuildCtx,
	all: ProcessedFile<any>[],
): AsyncIterable<ProcessedFile<any>> {
	await Promise.all(
		ctx.emitterKeys.map(async (k) => {
			const emitter = ctx.emitters[k];
			if ("preParse" in emitter) await emitter.preParse(ctx, all);
		}),
	);

	for (const vf of all) {
		const emitter = ctx.emitters[vf.emitter];
		assert(isDynamic(emitter), "expected dynamic emitter");
		yield* emitter.parse(ctx, vf, all);
	}
}

export async function* renderFiles(
	ctx: BuildCtx,
	all: ProcessedFile<any>[],
): AsyncIterableIterator<FilePath> {
	await Promise.all(
		ctx.emitterKeys.map(async (k) => {
			const emitter = ctx.emitters[k];
			if ("preRender" in emitter) await emitter.preRender(ctx, all);
		}),
	);

	for (const vf of all) {
		const emitter = ctx.emitters[vf.emitter];
		assert(isDynamic(emitter), "expected dynamic emitter");
		yield* emitter.render(ctx, vf, all);
	}
}
