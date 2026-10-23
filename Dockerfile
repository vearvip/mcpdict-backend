# 第一阶段：构建应用程序
FROM oven/bun:1.4.4 AS build

WORKDIR /app

# 安装依赖（使用锁文件，保证可复现）
COPY package.json bun.lockb .npmrc ./
RUN bun install --frozen-lockfile

# 复制源代码（数据库不需要参与编译，运行时作为外部文件复制）
COPY ./src ./src

# 构建生产版本
ENV NODE_ENV=production
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

# 第二阶段：最终镜像
FROM oven/bun:1.4.4

WORKDIR /app

# 复制构建产物
COPY --from=build /app/server server

# 复制数据库（构建前先运行 bun run data:fetch）
COPY ./data/mcpdict.db mcpdict.db

ENV NODE_ENV=production
ENV DB_PATH=/app/mcpdict.db

CMD ["./server"]

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:3000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
