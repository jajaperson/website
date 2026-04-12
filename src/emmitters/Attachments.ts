import { some } from "iterable-utilities";
import { BuildCtx } from "../util/ctx.js";
import { sluggifyVaultPath, VaultPath } from "../util/path.js";
import { DynamicEmitter, ProcessedFile } from "../emitters.js";
import { copy } from "../util/write.js";

export class Attachments implements DynamicEmitter<void> {
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

	async *render(ctx: BuildCtx, current: ProcessedFile<void>) {
		const { origin, slug } = current;

		await copy(ctx, origin!, slug);
	}
}
