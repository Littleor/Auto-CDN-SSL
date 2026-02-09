# Auto CDN SSL

面向 CDN 场景的 SSL 证书自动续签与部署平台（腾讯云 / 七牛云），提供可视化管理、自动化续签与一键部署能力，专注解决 CDN HTTPS 证书运维的成本问题。

- 中文（默认）
- English: `README.en.md`

## 核心功能
- CDN SSL 自动续签与到期提醒
- 续签后自动部署到 CDN（全局开关）
- 支持 HTTP-01 / DNS-01（腾讯云 DNS）验证
- CDN 凭据同步站点与状态
- 证书、部署、任务执行状态可视化
- SMTP 邮箱验证注册

## 技术栈
- 前端：React + Vite + TypeScript + Tailwind + shadcn 风格组件
- 后端：Node.js + TypeScript + Fastify
- 数据库：MySQL

## 项目结构
- `apps/backend`：后端服务（Fastify + MySQL）
- `apps/frontend`：前端控制台（React + Vite）
- `docs/PRD.md`：产品需求文档

## 本地启动

### 一键启动（前后端）
```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn dev
```

### 后端
```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/backend
cp .env.example .env
# 填写 JWT_SECRET 与 DATA_ENCRYPTION_KEY，并配置 MySQL 连接信息

cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace auto-ssl-backend dev
```

### 前端
```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/frontend
cp .env.example .env
# 如需修改 API 地址，编辑 VITE_API_URL

cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace frontend dev
```

## 环境变量

### 后端（`apps/backend/.env`）
- `JWT_SECRET`：JWT 密钥（必填）
- `DATA_ENCRYPTION_KEY`：AES-256-GCM 密钥，用于加密凭据（必填）
- `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE`：MySQL 连接信息（必填）
- `ACME_DIRECTORY_URL`：ACME 目录地址（默认 Let’s Encrypt）
- `ACME_ACCOUNT_EMAIL`：ACME 账户邮箱（可选；未设置时自动使用用户注册邮箱）
- `ACME_HTTP_HOST` / `ACME_HTTP_PORT`：HTTP-01 校验服务配置（可选）
- `ACME_SKIP_LOCAL_VERIFY`：是否跳过本地校验（可选）
- `ACME_DNS_WAIT_SECONDS` / `ACME_DNS_TTL`：DNS-01 等待与 TTL（可选）
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `FROM_EMAIL`：邮件服务（必填，用于邮箱验证）

### 前端（`apps/frontend/.env`）
- `VITE_API_URL`：后端地址（默认 `http://localhost:4000`）
- `VITE_ANALYTICS_SNIPPET`：统计脚本注入（可选，支持 `<script ...></script>`）

## ACME 说明
- ACME 账户邮箱默认使用当前登录用户的注册邮箱
- 其他 ACME 参数使用后端环境变量的默认值

## DNS-01 验证配置（腾讯云 DNS）
1. 在「DNS 凭据」中新建 `腾讯云 DNS` 凭据（SecretId / SecretKey）
2. 或者直接复用「CDN 凭据」里的腾讯云凭据（无需重复创建）
3. 在「域名验证」中按顶级域名配置验证方式（HTTP-01 / DNS-01）
4. 触发续签后系统会自动写入 `_acme-challenge` TXT 记录并等待生效

## 测试
```bash
yarn workspace auto-ssl-backend test
yarn workspace frontend build
```

## 提交规范
- `feat: ...` / `fix: ...` / `chore: ...` 等
- 功能完成后单独 commit，不自动 push

## License
- 暂未指定（如需开源协议请补充）
