# 第一阶段：构建和生成 mcpdict.db
FROM python:3.13-slim AS builder

WORKDIR /app

# 安装 Git、CMake 以及其他可能需要的工具和库
RUN apt-get update && \
    apt-get install -y git cmake g++ make && \
    rm -rf /var/lib/apt/lists/*

# 将构建脚本复制到容器中并执行以生成 mcpdict.db 
COPY ./scripts/ ./scripts/
COPY ./src ./src
RUN python ./scripts/mcpdict_builder.py

# 确认 mcpdict.db 文件是否已经生成
RUN ls -la ./scripts/

# 第二阶段：构建应用程序
FROM oven/bun AS build

WORKDIR /app

# Cache packages installation
COPY package.json .
COPY bun.lockb .
COPY .npmrc .

RUN bun install

# 复制源代码和之前阶段生成的 mcpdict.db
COPY ./src ./src
COPY --from=builder /app/src/database/mcpdict.db ./src/database/mcpdict.db

ENV NODE_ENV=production

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

# 第三阶段：最终镜像
FROM oven/bun

WORKDIR /app

# 复制构建产物
COPY --from=build /app/server server
# 复制之前阶段生成的 mcpdict.db
COPY --from=build /app/src/database/mcpdict.db mcpdict.db

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000
