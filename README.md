# Auto CDN SSL
[English Version](README.en.md)

面向 CDN 场景的 SSL 证书自动续签与部署平台（腾讯云 CDN / 七牛云 CDN）。

Auto CDN SSL 专注解决「CDN 域名多、证书多、手工续签/上传成本高、到期风险不可控」的问题：到期前自动续签，续签后自动下发到对应 CDN，配合可视化状态与部署记录，让 CDN HTTPS 长期稳定可控。

## 适用场景
- 你的证书只用于 CDN（腾讯云/七牛云），需要自动续签 + 自动部署
- 域名数量多，人工续签容易漏
- 需要把凭据、证书生命周期、部署状态集中管理并可追踪

## 核心能力
- 自动续签：定时任务到期前续签（阈值、执行时间可配置）
- 一键续签：控制台手动触发续签任务
- 自动部署：续签完成后自动部署到 CDN（全局开关）
- 域名验证：HTTP-01 / DNS-01（支持腾讯云 DNS；可复用腾讯云 CDN 凭据）
- 站点同步：从 CDN 平台同步域名与状态，自动生成站点
- 可视化：站点、证书、部署记录、任务状态
- 注册校验：SMTP 邮箱验证

## 技术栈
- 前端：React + Vite + TypeScript + Tailwind
- 后端：Node.js + TypeScript + Fastify
- 数据库：MySQL

## 项目结构
- `apps/backend`：后端服务（Fastify + MySQL）
- `apps/frontend`：前端控制台（React + Vite）
- `docs/PRD.md`：产品需求文档

## 快速开始（本地）

### 依赖
- Node.js 20+（建议）
- Yarn 1（本仓库使用 Yarn Workspaces）
- MySQL 8+（或兼容 MySQL 的服务）

### 安装
```bash
yarn
```

### 配置环境变量
后端：
```bash
cp apps/backend/.env.example apps/backend/.env
```

前端：
```bash
cp apps/frontend/.env.example apps/frontend/.env
```

`.env` 文件默认已被 gitignore，请勿提交敏感信息。

### 启动（前后端）
```bash
yarn dev
```

- 后端默认：`http://localhost:4000`
- 前端默认：`http://localhost:5173`
- 开发环境 API 文档：`http://localhost:4000/docs`

## 环境变量说明
以示例文件为准：`apps/backend/.env.example`、`apps/frontend/.env.example`。

### 后端（必填）
- `JWT_SECRET`：JWT 密钥（长度至少 16）
- `DATA_ENCRYPTION_KEY`：加密密钥（用于凭据与私钥加密存储；更换会导致历史数据无法解密）
- `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `FROM_EMAIL`
- `WEB_BASE_URL`：用于生成注册邮箱验证链接（例如 `http://localhost:5173`）

### 后端（可选/默认值）
- `CRON_SCHEDULE`：自动续签定时表达式（默认 `0 3 * * *`）
- `RENEWAL_THRESHOLD_DAYS`：默认提前续签天数（用户未配置时使用）
- `ACME_DIRECTORY_URL`：ACME 目录地址（默认 Let’s Encrypt）
- `ACME_SKIP_LOCAL_VERIFY` / `ACME_DNS_WAIT_SECONDS` / `ACME_DNS_TTL`

### 前端
- `VITE_API_URL`：后端地址（默认 `http://localhost:4000`）
- `VITE_ANALYTICS_SNIPPET`：统计脚本注入（可选，支持 `<script ...></script>`）

## ACME 与域名验证
- ACME 账户邮箱：默认使用当前用户注册邮箱（无需在控制台配置）
- HTTP-01：后端提供挑战路径 `/.well-known/acme-challenge/:token`，需要外网能访问到该路径（通常要求 80 端口可达）
- DNS-01（推荐）：在控制台配置腾讯云 DNS 凭据；系统会自动写入 `_acme-challenge` TXT 记录并等待生效

## 续签与部署策略
- 续签执行时间、提前续签阈值、是否自动部署：在控制台「续签设置」中按用户全局配置
- 自动部署开启时：续签成功后会自动下发证书到站点绑定的 CDN 平台凭据

## 测试
```bash
yarn test
yarn build
```

## 部署（生产）
- PM2 + Nginx：见 `docs/DEPLOY_PM2_NGINX.md`

## 安全说明
- 云厂商凭据与证书私钥会使用 AES-256-GCM 加密后存储（见 `DATA_ENCRYPTION_KEY`）
- 请妥善保管 `JWT_SECRET`、`DATA_ENCRYPTION_KEY`、SMTP 与云厂商密钥

## 贡献
欢迎提交 Issue / PR：
- Bug 修复请附复现步骤与日志
- 新增功能请先对齐 PRD 或在 Issue 中讨论
# Auto CDN SSL（auto-ssl）

[English](./README.en.md) | 中文

面向 CDN 场景的 SSL 证书自动化平台：统一管理多个站点的证书申请、续签与 CDN 部署（目前支持腾讯云 CDN、七牛云 CDN），并对敏感凭据/私钥进行加密存储。

## 你能用它做什么

- 为多个域名/站点申请与续签证书（Let's Encrypt / ACME）
- 支持按顶级域名配置验证方式：HTTP-01 / DNS-01（DNS-01 目前支持腾讯云 DNS）
- 自动部署证书到 CDN（腾讯云 / 七牛云）
- 控制台查看到期时间、续签/部署记录与失败原因
- 定时任务：到期前 X 天自动续签，可手动触发

## 项目结构

- `apps/backend`：Fastify + MySQL 后端（提供 API、任务调度、ACME 校验回调等）
- `apps/frontend`：React + Vite 前端控制台
- `docs/PRD.md`：产品需求文档

## 快速开始（本地开发）

### 前置依赖

- Node.js 18+（推荐 20+）
- Yarn 1.x（本项目使用 Yarn workspaces）
- MySQL（推荐 8.0+）
- SMTP（用于注册邮箱验证）

### 1) 安装依赖

```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn
```

### 2) 配置后端环境变量

```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/backend
cp .env.example .env
```

至少需要填好（其余可先用默认值）：

- `JWT_SECRET`：JWT 密钥（建议随机长字符串）
- `DATA_ENCRYPTION_KEY`：用于加密存储敏感数据（请勿随意更换，否则历史数据无法解密）
- `MYSQL_*`：MySQL 连接信息（确保数据库已创建）
- `SMTP_*` + `FROM_EMAIL`：发邮件用
- `WEB_BASE_URL`：前端地址（邮件验证链接会拼这个地址），本地默认 `http://localhost:5173`

完整示例见：`apps/backend/.env.example`。

### 3) 配置前端环境变量

```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/frontend
cp .env.example .env
```

本地默认即可（后端是 `http://localhost:4000`）：`apps/frontend/.env.example`。

### 4) 启动（前后端一起）

```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn dev
```

- 前端：`http://localhost:5173`
- 后端健康检查：`http://localhost:4000/health`
- 后端 API 文档（非 production 才启用）：`http://localhost:4000/docs`

## 怎么用（控制台操作流程）

1. 访问前端控制台，注册账号（会发送验证邮件）
2. 打开邮件里的链接完成验证，然后登录
3. 在「凭据」中新增：
   - CDN 凭据：`tencent`（腾讯云 CDN）或 `qiniu`（七牛云 CDN）
   - DNS 凭据（可选）：`tencent_dns`（用于 DNS-01）
4. 在「域名验证」按顶级域名选择验证方式：
   - HTTP-01：需要目标域名的 80 端口能访问到本服务的 `/.well-known/acme-challenge/*`
   - DNS-01：需要配置腾讯云 DNS 凭据，并等待解析生效（等待时间可在设置中调整）
5. 创建站点，选择证书来源（Let's Encrypt / 自签证书）、绑定 CDN 凭据，开启自动续签/自动部署
6. 手动触发申请/续签 + 部署，或等待定时任务自动执行

> 提示：CDN 场景通常更推荐 DNS-01（不依赖目标域名的 80 端口可达）。

## 单独部署（生产/自托管）

本项目默认前后端分离部署：前端是静态站点，后端是 Node 服务，数据库是 MySQL。

### 部署后端（Fastify）

1) 构建

```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace auto-ssl-backend build
```

2) 配置环境变量（建议仍放在 `apps/backend/.env`，并确保这些值在重启后保持不变）

- `DATA_ENCRYPTION_KEY`：一旦写入数据请勿更换
- `JWT_SECRET`：更换会导致已签发 token 失效
- `ACME_DIRECTORY_URL`：建议先用 staging 测试，确认流程无误再切换 production

3) 启动（建议在 `apps/backend` 目录下运行，便于读取 `.env` 并持久化 `data/`）

```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/backend
node dist/index.js
```

4) 持久化数据目录（重要）

- `apps/backend/data/acme-account.json`：ACME 账号私钥（建议做持久化卷/备份）

5) HTTP-01 校验的反向代理（如果使用 HTTP-01）

确保被验证域名的 `80` 端口能访问到后端的：

- `/.well-known/acme-challenge/:token`

如果后端不直接监听 80 端口，请在网关/Nginx 做转发（示例仅供参考）：

```nginx
location ^~ /.well-known/acme-challenge/ {
  proxy_pass http://127.0.0.1:4000;
}
```

### 部署前端（React/Vite）

1) 配置 API 地址（Vite 环境变量在**构建时注入**）

- 修改 `apps/frontend/.env` 的 `VITE_API_URL`
  - 例如：`VITE_API_URL=https://api.example.com`

2) 构建

```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace frontend build
```

构建产物在：`apps/frontend/dist`，使用 Nginx/静态托管服务发布即可。

### 数据库（MySQL）

- 确保 `MYSQL_DATABASE` 对应的库已创建
- 后端启动时会自动执行迁移（首次启动会创建表）

## 更多开发说明

- 开发文档：`docs/DEVELOPMENT.md`
