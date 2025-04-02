# 专用数据库构建 Dockerfile
FROM python:3.13-slim AS builder

WORKDIR /app

# 安装基础工具
RUN apt-get update && \
    apt-get install -y git cmake g++ make && \
    rm -rf /var/lib/apt/lists/*

# 声明构建参数用于打破缓存
ARG TIMESTAMP
ARG MCPDICT_REPO="https://gitcode.com/vearvip/MCPDict.git"
ARG PYPI_MIRROR="https://pypi.tuna.tsinghua.edu.cn/simple"

# 克隆仓库（含重试逻辑）
RUN echo "开始构建（TIMESTAMP=${TIMESTAMP}）" && \
    git config --global http.postBuffer 524288000 && \
    until git clone --depth 1 ${MCPDICT_REPO} MCPDict; do \
        echo "克隆失败，10秒后重试..."; sleep 10; \
    done

# 安装 Python 依赖
RUN cd MCPDict/tools && \
    pip install --retries 3 --timeout 60 \
    -r requirements.txt -i ${PYPI_MIRROR}

# 构建数据库
RUN cd MCPDict/tools && \
    python make.py -c

# 复制生成的文件
RUN mkdir -p /export/database && \
    cp MCPDict/app/src/main/assets/databases/mcpdict.db /export/database/ && \
    ([ -f MCPDict/方言.geojson ] && cp MCPDict/方言.geojson /export/database/ || true)

# 容器保持运行（按需使用）
CMD ["sleep", "infinity"]