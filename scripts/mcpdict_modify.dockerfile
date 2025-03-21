# Dockerfile
FROM oven/bun

WORKDIR /app

# 安装必要的系统依赖（如果有）
# RUN apt-get update && apt-get install -y ... 

# 复制项目文件
COPY package.json . 
COPY src ./src
COPY scripts ./scripts 
COPY .npmrc .

# 安装项目依赖
RUN bun install

# 设置数据库存储环境变量
ENV DB_PATH=/data/sub_mcpdict.db

# 运行时挂载数据卷
VOLUME /data

# 执行脚本
CMD ["bun", "run", "scripts/mcpdict_modify.ts"]