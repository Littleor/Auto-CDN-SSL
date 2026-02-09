# AGENTS.md

## 项目结构
- `/Users/littleor/Project/Interest/auto-ssl/apps/backend`：Fastify + SQLite 后端
- `/Users/littleor/Project/Interest/auto-ssl/apps/frontend`：React + Vite 前端控制台
- `/Users/littleor/Project/Interest/auto-ssl/docs/PRD.md`：产品需求文档

## 本地启动
### 后端
```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/backend
cp .env.example .env
# 填写 JWT_SECRET 与 DATA_ENCRYPTION_KEY

cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace auto-ssl-backend dev
```

### 前端
```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/frontend
cp .env.example .env
# VITE_API_URL 默认 http://localhost:4000

cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace frontend dev
```

## 关键环境变量
后端（`/Users/littleor/Project/Interest/auto-ssl/apps/backend/.env`）：
- `JWT_SECRET`：JWT 密钥
- `DATA_ENCRYPTION_KEY`：AES-256-GCM 密钥
- `DATABASE_URL`：SQLite 路径
- `ACME_ACCOUNT_EMAIL`：Let's Encrypt 账户邮箱
- `ACME_DIRECTORY_URL`：ACME 目录地址（默认 staging）

前端（`/Users/littleor/Project/Interest/auto-ssl/apps/frontend/.env`）：
- `VITE_API_URL`：后端地址

## 任务与调度
- 自动续签由 `node-cron` 触发，默认每天凌晨 3 点执行
- ACME HTTP-01 挑战路径：`/.well-known/acme-challenge/:token`

## 测试
```bash
yarn workspace auto-ssl-backend test
yarn workspace frontend build
```

## 提交规范
- `feat: ...` / `chore: ...` / `fix: ...` 等
- 功能完成后单独 commit，不自动 push
