import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { openDatabaseWithMeta } from "../../src/database/open";
import { CACHE_DIR, DEFAULT_DB_PATH } from "./paths";
import { fileSize, formatBytes, sha256File } from "./hash";
import { writeManifest } from "./manifest";

interface Options {
  repo: string;
  ref: string;
  dir: string;
  python: string;
  out: string;
  patch?: string;
  sourceCommit?: string;
  skipInstall: boolean;
  clean: boolean;
  check: boolean;
}

const DEFAULT_REPO = "https://github.com/osfans/MCPDict.git";

function parseArgs(argv: string[]): Options {
  const get = (name: string, fallback?: string): string | undefined => {
    const index = argv.indexOf(`--${name}`);
    return index >= 0 ? argv[index + 1] : fallback;
  };
  return {
    repo: get("repo", process.env.MCPDICT_REPO ?? DEFAULT_REPO)!,
    ref: get("ref", process.env.MCPDICT_REF ?? "master")!,
    dir: resolve(get("dir", resolve(CACHE_DIR, "source"))!),
    python: get("python", process.env.MCPDICT_PYTHON ?? "python3.12")!,
    out: resolve(get("out", DEFAULT_DB_PATH)!),
    patch: get("patch") ? resolve(get("patch")!) : undefined,
    sourceCommit: get("source-commit", process.env.MCPDICT_SOURCE_COMMIT),
    skipInstall: argv.includes("--skip-install"),
    clean: argv.includes("--clean"),
    check: argv.includes("--check"),
  };
}

async function run(command: string[], cwd?: string): Promise<void> {
  console.log(`\n$ ${command.join(" ")}`);
  const child = Bun.spawn(command, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
    env: process.env,
  });
  const code = await child.exited;
  if (code !== 0) {
    throw new Error(`命令失败 (exit ${code}): ${command.join(" ")}`);
  }
}

async function output(command: string[], cwd?: string): Promise<string> {
  const child = Bun.spawn(command, {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });
  const text = await new Response(child.stdout).text();
  const code = await child.exited;
  if (code !== 0) throw new Error(`命令失败: ${command.join(" ")}`);
  return text.trim();
}

async function ensureSource(options: Options): Promise<string> {
  const gitDir = resolve(options.dir, ".git");
  if (!existsSync(gitDir)) {
    mkdirSync(options.dir, { recursive: true });
    await run([
      "git",
      "clone",
      "--depth",
      "1",
      "--branch",
      options.ref,
      options.repo,
      options.dir,
    ]);
  } else {
    await run(["git", "fetch", "--depth", "1", "origin", options.ref], options.dir);
    await run(["git", "reset", "--hard", "FETCH_HEAD"], options.dir);
  }

  if (options.patch) {
    if (!existsSync(options.patch)) {
      throw new Error(`patch 不存在: ${options.patch}`);
    }
    // 上一次 apply 产生的新文件在 reset 后仍是 untracked，会阻止再次 apply。
    // 默认不动工作树；确实要复用时显式 --clean（会删除 tools/app 的未跟踪文件）。
    if (options.clean) {
      await run(["git", "clean", "-fd", "tools", "app"], options.dir);
    }
    await run(["git", "apply", "--whitespace=nowarn", options.patch], options.dir);
  }

  return output(["git", "rev-parse", "HEAD"], options.dir);
}

async function ensurePython(options: Options): Promise<{ python: string; version: string }> {
  const version = await output([options.python, "--version"]);
  const match = version.match(/(\d+)\.(\d+)/);
  if (!match) throw new Error(`无法识别 Python 版本: ${version}`);
  const major = Number(match[1]);
  const minor = Number(match[2]);
  if (major < 3 || (major === 3 && minor < 12)) {
    throw new Error(
      `源码构建需要 Python >= 3.12（当前 ${version}）；旧版本无法解析上游的 f-string`,
    );
  }

  if (options.skipInstall) {
    return { python: options.python, version };
  }

  const venv = resolve(options.dir, ".venv");
  const pip = resolve(venv, "bin", "pip");
  if (!existsSync(pip)) {
    await run([options.python, "-m", "venv", venv]);
  }
  return { python: resolve(venv, "bin", "python"), version };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const commit = await ensureSource(options);
  const { python } = await ensurePython(options);

  const toolsDir = resolve(options.dir, "tools");
  const requirements = resolve(toolsDir, "requirements.txt");
  if (!existsSync(requirements)) {
    throw new Error(`上游缺少 ${requirements}`);
  }

  if (!options.skipInstall) {
    console.log("\n📦 安装 Python 依赖...");
    const pip = resolve(options.dir, ".venv", "bin", "pip");
    const indexUrl =
      process.env.PIP_INDEX_URL ?? "https://pypi.tuna.tsinghua.edu.cn/simple";
    await run([pip, "install", "-i", indexUrl, "-r", requirements]);
  }

  const databasesDir = resolve(options.dir, "app/src/main/assets/databases");
  mkdirSync(databasesDir, { recursive: true });
  const builtDb = resolve(databasesDir, "mcpdict.db");
  rmSync(builtDb, { force: true });

  console.log("\n🔨 运行上游 make.py（默认不做 -c 同音字检查，可用 --check 开启）...");
  await run([python, "make.py", ...(options.check ? ["-c"] : [])], toolsDir);

  if (!existsSync(builtDb)) {
    throw new Error(`构建完成但没有找到 ${builtDb}`);
  }

  mkdirSync(resolve(options.out, ".."), { recursive: true });
  copyFileSync(builtDb, options.out);

  const { db, meta } = openDatabaseWithMeta(options.out);
  db.close();
  const dbSha256 = await sha256File(options.out);

  await writeManifest({
    schemaVersion: meta.schemaVersion,
    source: "source",
    release: null,
    sourceRepo: options.repo,
    sourceRef: options.ref,
    sourceCommit: options.sourceCommit ?? commit,
    dbSha256,
    dbSize: meta.size,
    generatedAt: new Date().toISOString(),
    tables: meta.tables,
    visibleDialects: meta.visibleDialects,
  });

  console.log("\n✅ 源码构建完成");
  console.log(`   commit: ${commit}`);
  console.log(`   DB: ${options.out} (${formatBytes(meta.size)})`);
  console.log(
    `   langs=${meta.tables.langs}, mcpdict=${meta.tables.mcpdict}, info=${meta.tables.info}, visible=${meta.visibleDialects}`,
  );
  console.log(`   sha256: ${dbSha256}`);
}

main().catch((error) => {
  console.error(`\n❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
