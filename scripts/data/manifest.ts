import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { MANIFEST_PATH } from "./paths";
import type { TableCounts } from "../../src/database/open";

export interface DataManifest {
  schemaVersion: number;
  source: "apk" | "local" | "source";
  release: string | null;
  assetName?: string;
  assetSize?: number;
  assetSha256?: string;
  sourceRepo?: string;
  sourceRef?: string;
  sourceCommit?: string;
  sourcePatch?: string;
  dbSha256: string;
  dbSize: number;
  generatedAt: string;
  tables: TableCounts;
  visibleDialects: number;
}

export async function writeManifest(manifest: DataManifest, path = MANIFEST_PATH): Promise<void> {
  mkdirSync(dirname(path), { recursive: true });
  await Bun.write(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

export async function readManifest(path = MANIFEST_PATH): Promise<DataManifest | null> {
  if (!existsSync(path)) return null;
  return (await Bun.file(path).json()) as DataManifest;
}
