# 汉字音典 服务端

> 汉字音典服务端，基于 [Bun](https://github.com/oven-sh/bun) 和 [Elysia](https://github.com/elysiajs/elysia) 开发，数据源于 [osfans/MCPDict](https://github.com/osfans/MCPDict)。

当前是**服务端仓库**，其他仓库：

- Web 前端：[vearvip/mcpdict-frontend](https://github.com/vearvip/mcpdict-frontend)
- 微信小程序：[vearvip/mcpdict-miniapp](https://github.com/vearvip/mcpdict-miniapp)

## 环境要求

- [Bun](https://bun.sh/) >= 1.3
- `unzip`（从 Release APK 中提取数据库）
- Docker（仅构建/运行镜像时需要）

## 快速上手

```bash
bun install

# 从 osfans/MCPDict 最新 Release 下载 APK，提取 mcpdict.db
# 首次约下载 240MB，解压后数据库约 500MB
bun run data:fetch

# 校验表结构、行数、FTS 查询、聲調 JSON
bun run data:validate

# 生成测试用的小数据库（< 5MB）
bun run data:fixture

bun run test
bun run typecheck
bun run dev
```

启动后可访问：

- API：`http://localhost:3000`
- Swagger：`http://localhost:3000/swagger`
- 健康检查：`http://localhost:3000/health`
- 数据信息：`http://localhost:3000/meta`

## 数据构建

数据默认从上游最新 Release 的 APK 中提取，产物在：

```text
data/
  mcpdict.db      # 数据库（不提交 git）
  manifest.json   # release、sha256、行数、生成时间
```

常用命令：

```bash
# 使用本地 APK
bun run data:fetch --apk /path/to/20261022.APK

# 强制重新下载
bun run data:fetch --force

# 指定输出位置
bun run data:fetch --out /path/to/mcpdict.db

# 校验指定数据库
bun run data:validate --db /path/to/mcpdict.db
```

> `createdb` 仍然保留，等价于 `data:fetch`（旧文档里的 source build 已不再作为默认流程）。

### 数据库路径

服务端按以下顺序查找数据库：

1. `DB_PATH` 环境变量
2. `./data/mcpdict.db`
3. `./src/database/mcpdict.db`
4. `./mcpdict.db`

生产环境建议显式设置：

```bash
DB_PATH=/data/mcpdict.db bun run dev
```

## 测试

```bash
bun run test
bun run typecheck
```

测试使用 `tests/fixtures/mcpdict.sample.db`，不依赖完整数据库，也不会访问网络。

## Docker

```bash
bun run build   # 构建镜像
bun run work    # 运行容器（3000 端口）
```

当前 Dockerfile 仍从 `src/database/mcpdict.db` 复制数据库；Phase 5 会改为外置 volume / 按 manifest 下载。

## 接口兼容

Web 前端、微信小程序和第三方都可能调用旧接口。**不要删除或改变**以下旧接口的响应结构：

- `GET /dialect`
- `POST /char`
- `POST /char/byType`
- `POST /char/long`
- `POST /char/info`
- `GET /char/variant`
- `GET /dialect/item`

新接口统一放在 `/api/v1`，旧接口保留为 deprecated alias。

## LICENSE

本项目使用 [MIT](./LICENSE) 开源协议。数据来源与版权说明见上游 [osfans/MCPDict](https://github.com/osfans/MCPDict)。
