import { HomePage } from "../components/pages/Home.js";
import { ProcessedFile, StaticEmitter } from "../emitters.js";
import { BuildCtx } from "../util/ctx.js";
import { renderJsx } from "../util/jsx.js";
import { FullSlug } from "../util/path.js";
import { write } from "../util/write.js";

export class Pages implements StaticEmitter {
	symbol = Symbol();

	async *render(ctx: BuildCtx, all: ProcessedFile<any>[]) {
		yield write(ctx, "index" as FullSlug, ".html", renderJsx(<HomePage />));
	}
}
