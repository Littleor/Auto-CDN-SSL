# Auto-SSL

面向开发者的证书自动申请、续签、CDN 部署平台（腾讯云 / 七牛云）。

## 技术栈
- 前端：React + Vite + TypeScript + Tailwind + shadcn 风格组件
- 后端：Node.js + TypeScript + Fastify
- 数据库：MySQL

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

## 文档
- 产品需求文档：`/Users/littleor/Project/Interest/auto-ssl/docs/PRD.md`

## DNS-01 验证配置（腾讯云 DNS）
1. 在「DNS 凭据」中新建 `腾讯云 DNS` 凭据（SecretId / SecretKey）
2. 或者直接复用「CDN 凭据」里的腾讯云凭据（无需重复创建）
3. 在「域名验证」中按顶级域名配置验证方式（HTTP-01 / DNS-01）
4. 触发续签后系统会自动写入 `_acme-challenge` TXT 记录并等待生效
