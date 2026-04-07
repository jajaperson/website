import path from "path";

export const BUILD = "./build/build.ts";
export const CWD = process.cwd();
export const CACHE_DIR = "./.build_cache";
export const CACHE_FILE = path.join(CACHE_DIR, "transpiled-build.mjs");
