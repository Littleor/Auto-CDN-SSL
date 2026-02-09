# Auto-SSL

面向开发者的证书自动申请、续签、CDN 部署平台（腾讯云 / 七牛云）。

## 技术栈
- 前端：React + Vite + TypeScript + Tailwind + shadcn 风格组件
- 后端：Node.js + TypeScript + Fastify
- 数据库：SQLite（默认）

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
# 填写 JWT_SECRET 与 DATA_ENCRYPTION_KEY

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

## 文档
- 产品需求文档：`/Users/littleor/Project/Interest/auto-ssl/docs/PRD.md`
