import { some } from "iterable-utilities";

import { DynamicEmitter, PreprocessedFile } from "../emitters.js";
import { BuildCtx } from "../util/ctx.js";
import { VaultPath, sluggifyVaultPath } from "../util/path.js";
import { copy } from "../util/write.js";

export class Attachments implements DynamicEmitter {
	symbol = Symbol();
	attachmentDirs: string[];

	constructor(...attachmentDirs: string[]) {
		this.attachmentDirs = attachmentDirs;
	}

	async *preProcess(ctx: BuildCtx, vp: VaultPath) {
		if (!some(this.attachmentDirs, (dir) => vp.startsWith(dir))) return;

		yield {
			origin: vp,
			slug: sluggifyVaultPath(vp),
			emitter: this.symbol,
		};
	}

	async render(ctx: BuildCtx, current: PreprocessedFile) {
		const { origin, slug } = current;

		return await copy(ctx, origin!, slug);
	}
}
