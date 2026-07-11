import { BuildCtx } from "./util/ctx.js";
import { FilePath, FullSlug, VaultPath } from "./util/path.js";

export type PreprocessedFile = {
	/** Destination slug for this file once fully processed */
	slug: FullSlug;
	/** File in vault whence this file originated */
	origin?: VaultPath;
	data?: {
		title?: string;
		/** Used to store scripts that need to be loaded on the emitted page */
		scripts?: {
			[key: string]: string;
		};
		[key: string]: any;
	};
	/** Symbol for the emitter responsible for this file. Should match `emitter.symbol`. */
	emitter: symbol;
};

declare module "vfile" {
	interface DataMap {
		file: PreprocessedFile;
	}
}

interface BaseEmitter {
	symbol: symbol;
}

export interface StaticEmitter extends BaseEmitter {
	render(ctx: BuildCtx, all: PreprocessedFile[]): AsyncIterableIterator<FilePath>;
}

export interface DynamicEmitter extends BaseEmitter {
	preProcess(ctx: BuildCtx, vp: VaultPath): AsyncIterableIterator<PreprocessedFile>;

	preRender?(ctx: BuildCtx, all: PreprocessedFile[]): Promise<void> | void;

	render(ctx: BuildCtx, current: PreprocessedFile, all: PreprocessedFile[]): Promise<FilePath>;
}

export type Emitter = DynamicEmitter | StaticEmitter;

export function isDynamic(emitter: Emitter): emitter is DynamicEmitter {
	return "preProcess" in emitter;
}

export async function* preprocessFiles(
	ctx: BuildCtx,
	fps: AsyncIterable<VaultPath>,
): AsyncIterableIterator<PreprocessedFile> {
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

// export async function* parseFiles(
// 	ctx: BuildCtx,
// 	all: ProcessedFile<any>[],
// ): AsyncIterable<ProcessedFile<any>> {
// 	await Promise.all(
// 		ctx.emitterKeys.map(async (k) => {
// 			const emitter = ctx.emitters[k];
// 			if ("preParse" in emitter) await emitter.preParse(ctx, all);
// 		}),
// 	);

// 	for (const vf of all) {
// 		const emitter = ctx.emitters[vf.emitter];
// 		assert(isDynamic(emitter), "expected dynamic emitter");
// 		if (typeof emitter.parse === "function") {
// 			try {
// 				yield* emitter.parse(ctx, vf, all);
// 			} catch (e) {
// 				console.log(styleText("red", `Error parsing \`${vf.origin ?? vf.slug}\`:`));
// 				throw e;
// 			}
// 		} else {
// 			yield vf;
// 		}
// 	}
// }

// export async function* renderFiles(
// 	ctx: BuildCtx,
// 	all: ProcessedFile<any>[],
// ): AsyncIterableIterator<FilePath> {
// 	for (const k of ctx.emitterKeys) {
// 		const emitter = ctx.emitters[k];
// 		if (!isDynamic(emitter)) {
// 			yield* emitter.render(ctx, all);
// 		}
// 	}

// 	await Promise.all(
// 		ctx.emitterKeys.map(async (k) => {
// 			const emitter = ctx.emitters[k];
// 			if ("preRender" in emitter) await emitter.preRender(ctx, all);
// 		}),
// 	);

// 	for (const vf of all) {
// 		const emitter = ctx.emitters[vf.emitter];
// 		assert(isDynamic(emitter), "expected dynamic emitter");
// 		try {
// 			yield* emitter.render(ctx, vf, all);
// 		} catch (e) {
// 			console.log(styleText("red", `Error rendering \`${vf.origin ?? vf.slug}\`:`));
// 			throw e;
// 		}
// 	}
// }
