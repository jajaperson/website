import { BuildCtx } from "./util/ctx.js";
import { FullSlug, VaultPath } from "./util/path.js";

export interface PreprocessedFile {
	slug: FullSlug;
	origin?: VaultPath;
	content?: string;
	data: {
		[key: string]: any;
	};
}

interface BaseEmitter {
	dynamic: boolean;
	symbol: Symbol;
}

export interface DynamicEmitter extends BaseEmitter {
	dynamic: true;
	preProcessor: (ctx: BuildCtx, vp: VaultPath) => AsyncIterable<PreprocessedFile>;
}

export type Emitter = DynamicEmitter;

export async function* preprocessFiles(
	ctx: BuildCtx,
	fps: AsyncIterable<VaultPath>,
): AsyncIterableIterator<[Symbol, PreprocessedFile]> {
	for await (const fp of fps) {
		for (const emitter of ctx.cfg.emitters) {
			for await (const vf of emitter.preProcessor(ctx, fp)) {
				yield [emitter.symbol, vf];
			}
		}
	}
}
