# 第一阶段：构建应用程序
FROM oven/bun AS build

WORKDIR /app

# 安装依赖
COPY package.json . 
COPY .npmrc .
RUN bun install

# 复制源代码
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
FROM oven/bun

WORKDIR /app

# 复制构建产物
COPY --from=build /app/server server
# 复制数据库
COPY --from=build /app/src/database/mcpdict.db mcpdict.db

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000



