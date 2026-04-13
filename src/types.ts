import { Emitter } from "./emitters.js";

export interface BuildConfig {
	vault: string;
	ignorePatterns: string[];
	emitters: Emitter[];
}
