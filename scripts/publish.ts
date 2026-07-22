const REGISTRY_HOST = "crpi-y6tzwvqgvhqozlnl.cn-hangzhou.personal.cr.aliyuncs.com";
const REPO_PATH = "vear_dockerhub/mcpdict_backend";
const FULL_REPO = `${REGISTRY_HOST}/${REPO_PATH}`;
const USERNAME = "1262122327@qq.com";
const LOCAL_IMAGE = "mcpdict_backend";

// 使用分钟级精度，避免同小时内多次构建导致覆盖
const now = new Date();
const tag = [
  String(now.getFullYear()).slice(-2),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
  String(now.getHours()).padStart(2, '0'),
  String(now.getMinutes()).padStart(2, '0'),
].join('.'); // 输出示例: 26.07.22.1205

const timestampedImage = `${FULL_REPO}:${tag}`;
const latestImage = `${FULL_REPO}:latest`;

console.log(`🏷️  Version Tag : ${tag}`);
console.log(`📦 Timestamped: ${timestampedImage}`);
console.log(`📦 Latest     : ${latestImage}\n`);

// 定义需要按顺序执行的命令
const steps: { label: string; cmd: string[] }[] = [
  {
    label: "🔐 Logging in to registry",
    cmd: ["docker", "login", "--username", USERNAME, REGISTRY_HOST],
  },
  {
    label: `🏷️  Tagging version image (${tag})`,
    cmd: ["docker", "image", "tag", LOCAL_IMAGE, timestampedImage],
  },
  {
    label: "🏷️  Tagging latest image",
    cmd: ["docker", "image", "tag", LOCAL_IMAGE, latestImage],
  },
  {
    label: `⬆️  Pushing version image (${tag})`,
    cmd: ["docker", "push", timestampedImage],
  },
  {
    label: "⬆️  Pushing latest image",
    cmd: ["docker", "push", latestImage],
  },
];

for (const step of steps) {
  console.log(`▶ ${step.label}`);
  console.log(`  $ ${step.cmd.join(' ')}`);

  const proc = Bun.spawn(step.cmd, {
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",   // ✅ 继承父进程标准输入，允许键盘输入密码
    pty: true,          // ✅ 分配伪终端，让 docker 认为是交互式环境
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    console.error(`\n❌ Step failed: "${step.label}" (exit code ${exitCode})`);
    process.exit(exitCode);
  }
  console.log();
}

console.log(`✅ All done!`);
console.log(`   Version: ${timestampedImage}`);
console.log(`   Latest : ${latestImage}`);