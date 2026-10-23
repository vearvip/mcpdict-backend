import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { openDatabaseWithMeta } from "../../src/database/open";
import { CACHE_DIR, DEFAULT_DB_PATH } from "./paths";
import { fileSize, formatBytes, sha256File } from "./hash";
import { writeManifest } from "./manifest";

const REPO = "osfans/MCPDict";
const DB_ENTRY = "assets/databases/mcpdict.db";

interface ReleaseAsset {
  name: string;
  size: number;
  browser_download_url: string;
}

interface ReleaseInfo {
  tagName: string;
  asset: ReleaseAsset;
}

interface Options {
  apk?: string;
  url?: string;
  out: string;
  force: boolean;
}

function parseArgs(argv: string[]): Options {
  const get = (name: string): string | undefined => {
    const index = argv.indexOf(`--${name}`);
    return index >= 0 ? argv[index + 1] : undefined;
  };

  return {
    apk: get("apk"),
    url: get("url"),
    out: resolve(get("out") ?? DEFAULT_DB_PATH),
    force: argv.includes("--force"),
  };
}

async function resolveLatestRelease(): Promise<ReleaseInfo> {
  console.log(`🔍 获取 ${REPO} 最新 Release...`);
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/releases/latest`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "mcpdict-data-fetch",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API 失败: HTTP ${response.status} ${await response.text()}`,
    );
  }

  const release = (await response.json()) as {
    tag_name?: string;
    assets?: ReleaseAsset[];
  };
  const asset = release.assets?.find((item) =>
    item.name.toLowerCase().endsWith(".apk"),
  );

  if (!asset) throw new Error("最新 Release 中没有 .APK 资产");
  return { tagName: release.tag_name ?? "unknown", asset };
}

async function downloadFile(url: string, destination: string): Promise<void> {
  console.log(`⬇️  下载 ${url}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "mcpdict-data-fetch" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`下载失败: HTTP ${response.status} ${response.statusText}`);
  }
  mkdirSync(dirname(destination), { recursive: true });
  await Bun.write(destination, response);
}

async function extractDatabase(apkPath: string, outPath: string): Promise<void> {
  const unzip = Bun.which("unzip");
  if (!unzip) {
    throw new Error("找不到 unzip 命令；请安装 unzip 后重试");
  }

  mkdirSync(dirname(outPath), { recursive: true });
  const tempPath = `${outPath}.tmp-${process.pid}`;
  rmSync(tempPath, { force: true });

  console.log(`📦 从 APK 提取 ${DB_ENTRY}...`);
  const child = Bun.spawn([unzip, "-p", apkPath, DB_ENTRY], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const writePromise = Bun.write(
    Bun.file(tempPath),
    new Response(child.stdout),
  );
  const stderrPromise = new Response(child.stderr).text();
  const exitCode = await child.exited;
  await writePromise;
  const stderr = await stderrPromise;

  if (exitCode !== 0) {
    rmSync(tempPath, { force: true });
    throw new Error(`unzip 失败 (exit ${exitCode}): ${stderr.trim()}`);
  }

  renameSync(tempPath, outPath);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  let release: { tagName: string; asset: ReleaseAsset };
  let source: "apk" | "local" = "apk";

  if (options.apk) {
    const apkPath = resolve(options.apk);
    if (!existsSync(apkPath)) throw new Error(`APK 不存在: ${apkPath}`);
    release = {
      tagName: "local",
      asset: {
        name: basename(apkPath),
        size: fileSize(apkPath),
        browser_download_url: apkPath,
      },
    };
    source = "local";
  } else if (options.url) {
    const name = basename(new URL(options.url).pathname) || "mcpdict.apk";
    release = {
      tagName: "url",
      asset: {
        name,
        size: 0,
        browser_download_url: options.url,
      },
    };
  } else {
    release = await resolveLatestRelease();
  }

  const apkPath = options.apk
    ? resolve(options.apk)
    : resolve(CACHE_DIR, release.asset.name);

  if (!options.apk) {
    mkdirSync(CACHE_DIR, { recursive: true });
    const needsDownload =
      options.force ||
      !existsSync(apkPath) ||
      (release.asset.size > 0 && fileSize(apkPath) !== release.asset.size);

    if (needsDownload) {
      await downloadFile(release.asset.browser_download_url, apkPath);
    } else {
      console.log(`♻️  复用缓存: ${apkPath}`);
    }
  }

  const assetSize = fileSize(apkPath);
  const assetSha256 = await sha256File(apkPath);
  console.log(`   APK: ${formatBytes(assetSize)} sha256=${assetSha256}`);

  await extractDatabase(apkPath, options.out);

  const { db, meta } = openDatabaseWithMeta(options.out);
  db.close();

  const dbSha256 = await sha256File(options.out);
  await writeManifest({
    schemaVersion: meta.schemaVersion,
    source,
    release: release.tagName,
    assetName: release.asset.name,
    assetSize,
    assetSha256,
    dbSha256,
    dbSize: meta.size,
    generatedAt: new Date().toISOString(),
    tables: meta.tables,
    visibleDialects: meta.visibleDialects,
  });

  console.log("\n✅ 数据库准备完成");
  console.log(`   DB: ${options.out} (${formatBytes(meta.size)})`);
  console.log(`   表: langs=${meta.tables.langs}, mcpdict=${meta.tables.mcpdict}, info=${meta.tables.info}`);
  console.log(`   可见方言点: ${meta.visibleDialects}`);
  console.log(`   manifest: data/manifest.json`);
}

main().catch((error) => {
  console.error(`\n❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
