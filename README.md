# 汉字音典 服务端 
## 项目介绍
> 汉字音典服务端，基于[Bun](https://github.com/oven-sh/bun)和[Elysia](https://github.com/elysiajs/elysia)开发，数据源于[osfans/MCPDict](https://github.com/osfans/MCPDict)
## 项目依赖
  - 运行环境：[Bun](https://github.com/oven-sh/bun)
  - 服务端框架：[Elysia](https://github.com/elysiajs/elysia)
  - 第三方库：
    - 汉字处理工具库：[@vearvip/hanzi-utils](https://github.com/vearvip/hanzi-utils) 
## 接口文档地址
> [https://server.mcpdict.vear.vip/swagger](https://server.mcpdict.vear.vip/swagger)
## 快速上手
### 开发阶段
#### 安装依赖 
```bash
bun install
``` 
#### 启动项目
```bash
bun run dev
```
> 打开 http://localhost:3000/swagger 查看当前接口文档

### 部署阶段
#### 打包docker镜像
```bash
bun run build
``` 
#### 运行docker镜像 
```bash
bun run work
```
#### 一键构建并运行
```bash
bun run deploy
```
 
## LICENSE
本项目使用 [MIT](./LICENSE) 开源协议
