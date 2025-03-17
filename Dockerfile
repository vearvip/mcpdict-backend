# 第一阶段：构建和生成 mcpdict.db
FROM python:3.13-slim AS builder

WORKDIR /app

# 安装依赖（包含 git 和编译工具）
RUN apt-get update && \
    apt-get install -y git cmake g++ make && \
    rm -rf /var/lib/apt/lists/*

# 声明构建参数用于打破缓存
ARG TIMESTAMP
ARG MCPDICT_REPO="https://gitcode.com/vearvip/MCPDict.git"
ARG PYPI_MIRROR="https://pypi.tuna.tsinghua.edu.cn/simple"

# 克隆仓库并构建数据库
RUN echo "开始构建（TIMESTAMP=${TIMESTAMP}）" && \
    git clone --depth 1 ${MCPDICT_REPO} MCPDict && \
    cd MCPDict/tools && \
    pip install -r requirements.txt -i ${PYPI_MIRROR} && \
    # test -f tables/data/mulcodechar.dt || (echo "必要文件缺失"; exit 1) && \
    python make.py -c && \
    cd ../.. && \
    mkdir -p src/database && \
    cp MCPDict/app/src/main/assets/databases/mcpdict.db src/database/ && \
    ( [ -f MCPDict/方言.geojson ] && cp MCPDict/方言.geojson src/database/ || echo "方言.geojson 不存在，跳过复制" )

# 第二阶段：构建应用程序
FROM oven/bun AS build

WORKDIR /app

# 安装依赖
COPY package.json .
COPY bun.lockb .
COPY .npmrc .
RUN bun install

# 复制源代码和数据库（之前阶段生成的 mcpdict.db）
COPY ./src ./src
COPY --from=builder /app/src/database/mcpdict.db ./src/database/mcpdict.db

# 构建生产版本
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



