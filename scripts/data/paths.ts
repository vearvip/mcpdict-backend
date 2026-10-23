import { resolve } from "node:path";

export const ROOT = resolve(import.meta.dir, "../..");
export const DATA_DIR = resolve(ROOT, "data");
export const CACHE_DIR = resolve(ROOT, ".cache/mcpdict");
export const DEFAULT_DB_PATH = resolve(DATA_DIR, "mcpdict.db");
export const MANIFEST_PATH = resolve(DATA_DIR, "manifest.json");
export const FIXTURE_PATH = resolve(ROOT, "tests/fixtures/mcpdict.sample.db");
