# Auto CDN SSL

面向 CDN 场景的 SSL 证书自动续签与部署平台（腾讯云 CDN / 七牛云 CDN）。

Auto CDN SSL 专注解决「CDN 域名多、证书多、手工续签/上传成本高、到期风险不可控」的问题：到期前自动续签，续签后自动下发到对应 CDN，配合可视化状态与部署记录，让 CDN HTTPS 长期稳定可控。

English: [README.en.md](README.en.md)

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

## 安全说明
- 云厂商凭据与证书私钥会使用 AES-256-GCM 加密后存储（见 `DATA_ENCRYPTION_KEY`）
- 请妥善保管 `JWT_SECRET`、`DATA_ENCRYPTION_KEY`、SMTP 与云厂商密钥

## 贡献
欢迎提交 Issue / PR：
- Bug 修复请附复现步骤与日志
- 新增功能请先对齐 PRD 或在 Issue 中讨论

## License
暂未指定（如计划开源发布，请补充开源协议文件）。
