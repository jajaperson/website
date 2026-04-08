import { BuildCtx } from "./util/ctx.js";
import { FullSlug, VaultPath } from "./util/path.js";

export interface PreprocessedFile<PreContent = string> {
	/** Destination slug for this file once fully processed */
	slug: FullSlug;
	/** File in vault whence this file originated */
	origin?: VaultPath;
	/** Preprocessed content of the file */
	content?: PreContent;
	data?: {
		[key: string]: any;
	};
	/** Symbol for the emitter responsible for this file. Should match `emitter.symbol`. */
	emitter: Symbol;
}

interface BaseEmitter {
	dynamic: boolean;
	symbol: Symbol;
}

export interface DynamicEmitter<PreContent = string> extends BaseEmitter {
	dynamic: true;
	preProcess: (ctx: BuildCtx, vp: VaultPath) => AsyncIterable<PreprocessedFile<PreContent>>;
}

export type Emitter = DynamicEmitter<any>;

export async function* preprocessFiles(
	ctx: BuildCtx,
	fps: AsyncIterable<VaultPath>,
): AsyncIterableIterator<PreprocessedFile> {
	for await (const fp of fps) {
		for (const emitter of ctx.cfg.emitters) {
			for await (const vf of emitter.preProcess(ctx, fp)) {
				yield vf;
			}
		}
	}
}
