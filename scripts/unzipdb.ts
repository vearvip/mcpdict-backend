import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ==================== 配置区 ====================
const REPO = "osfans/MCPDict";
const TARGET_DB_PATH = "assets/databases/mcpdict.db"; // APK 内部的相对路径
const OUTPUT_DIR = path.resolve(__dirname, "../src/database"); // 输出目录
const TEMP_DIR = path.resolve(__dirname, "../.temp_apk_extract"); // 临时解压目录
// ================================================

/**
 * 封装 HTTPS GET 请求（支持重定向）
 */
function fetch(url: string, options: https.RequestOptions = {}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { ...options, headers: { "User-Agent": "NodeJS-Script", ...options.headers } }, (res) => {
      // 处理 GitHub 下载链接的 302 重定向
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location, options).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * 获取最新 Release 中 .APK 结尾的资产下载链接
 */
async function getApkDownloadUrl(): Promise<string> {
  console.log(`🔍 正在获取 ${REPO} 的最新 Release 信息...`);
  const apiUrl = `https://api.github.com/repos/${REPO}/releases/latest`;
  const data = await fetch(apiUrl, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });

  const release = JSON.parse(data.toString());
  const apkAsset = release.assets?.find(
    (asset: any) => asset.name.toLowerCase().endsWith(".apk")
  );

  if (!apkAsset) {
    throw new Error("❌ 在最新 Release 中未找到 .APK 文件");
  }

  console.log(`✅ 找到 APK: ${apkAsset.name} (${(apkAsset.size / 1024 / 1024).toFixed(2)} MB)`);
  return apkAsset.browser_download_url;
}

/**
 * 主流程
 */
async function main() {
  try {
    // 1. 获取 APK 下载链接
    const downloadUrl = await getApkDownloadUrl();
    const apkFileName = path.basename(new URL(downloadUrl).pathname);
    const apkFilePath = path.join(TEMP_DIR, apkFileName);

    // 2. 创建临时目录 & 输出目录
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // 3. 下载 APK
    console.log(`⬇️  正在下载 ${apkFileName}...`);
    const apkBuffer = await fetch(downloadUrl);
    fs.writeFileSync(apkFilePath, apkBuffer);
    console.log(`✅ 下载完成: ${apkFilePath}`);

    // 4. 解压 APK（APK 本质是 ZIP，使用系统 unzip 命令）
    console.log(`📦 正在解压 APK 到临时目录...`);
    execSync(`unzip -o "${apkFilePath}" -d "${TEMP_DIR}"`, { stdio: "pipe" });
    console.log("✅ 解压完成");

    // 5. 提取目标数据库文件
    const extractedDbPath = path.join(TEMP_DIR, TARGET_DB_PATH);
    if (!fs.existsSync(extractedDbPath)) {
      throw new Error(`❌ 未在 APK 中找到目标文件: ${TARGET_DB_PATH}`);
    }

    const outputDbPath = path.join(OUTPUT_DIR, "mcpdict.db");
    fs.copyFileSync(extractedDbPath, outputDbPath);
    console.log(`✅ 数据库已提取到: ${outputDbPath}`);

    // 6. 清理：删除临时文件夹和 APK
    console.log(`🧹 正在清理临时文件...`);
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log("✅ 清理完成");

    console.log("\n🎉 全部操作成功完成！");
  } catch (err: any) {
    console.error(err.message || err);
    // 出错时也尝试清理临时文件
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    process.exit(1);
  }
}

main();