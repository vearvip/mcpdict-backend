#专用数据库构建 Dockerfile
FROM python:3.13-slim AS builder

WORKDIR /app

# 安装依赖
RUN apt-get update && \
    apt-get install -y git cmake g++ make && \
    rm -rf /var/lib/apt/lists/*

ARG MCPDICT_REPO="https://gitcode.com/vearvip/MCPDict.git"
ARG PYPI_MIRROR="https://pypi.tuna.tsinghua.edu.cn/simple"

# 克隆仓库并构建数据库
RUN git clone --depth 1 ${MCPDICT_REPO} MCPDict && \
    cd MCPDict/tools && \
    pip install -r requirements.txt -i ${PYPI_MIRROR} && \
    python make.py -c

# 构建阶段直接将文件复制到输出目录，**移除VOLUME指令避免挂载覆盖**
RUN mkdir -p /export/database && \
    cp MCPDict/app/src/main/assets/databases/mcpdict.db /export/database/ && \
    ([ -f MCPDict/方言.geojson ] && cp MCPDict/方言.geojson /export/database/ || true)

# 添加执行命令，确保容器运行时完成复制后退出
CMD ["sh", "-c", "cp -a /export/database/. /export/database/ && sleep infinity"]
