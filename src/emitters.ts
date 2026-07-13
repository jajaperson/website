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
