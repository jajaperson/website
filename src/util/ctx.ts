import { Emitter } from "../emitters.js";
import { BuildConfig } from "../types.js";

export interface Argv {
	output: string;
	serve: boolean;
	watch: boolean;
	port: number;
	wsPort: number;
	concurrency: number;
}

export interface BuildCtx {
	argv: Argv;
	cfg: BuildConfig;
	emitters: {
		[key: symbol]: Emitter;
	};
	emitterKeys: symbol[];
}
