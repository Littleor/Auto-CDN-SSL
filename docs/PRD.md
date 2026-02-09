# Auto-SSL 证书自动续签系统 PRD

## 1. 背景与目标
面向多开发者/团队的证书自动化平台，统一管理多网站的 SSL 申请、续签与 CDN 部署（腾讯云、七牛云）。

### 核心目标
- 统一管理开发者、网站、证书与部署状态
- 自动申请/续签证书，支持定时续签与手动触发
- 自动部署证书到腾讯云 CDN、七牛云 CDN
- 提供现代化前端控制台

### 非目标
- 不提供域名注册/解析服务
- 不替代云厂商控制台全部能力

## 2. 角色与场景
- 开发者：管理多个网站，查看证书状态与部署记录
- 团队管理员：管理团队成员与凭据（MVP 暂不支持团队级 RBAC）

## 3. 关键用户故事
1. 我可以注册/登录后管理自己的证书
2. 我可以为多个网站配置 CDN 平台凭据并自动部署
3. 我可以查看证书到期时间、续签记录与失败原因
4. 我可以手动触发“申请/续签 + 部署”

## 4. 功能需求（MVP）
### 账户与权限
- 注册 / 登录 / 刷新 Token / 登出

### 网站管理
- 创建/编辑/删除网站
- 为网站绑定 CDN 平台凭据（腾讯云、七牛云）
- 云平台同步：一键拉取在用域名与状态，自动生成站点

### 证书与续签
- 证书来源：Let's Encrypt（ACME）/ 自签证书（开发环境）
- 定时任务：到期前 X 天自动续签
- 手动触发续签

### CDN 部署
- 腾讯云 CDN：上传证书并绑定域名
- 七牛云 CDN：上传证书并绑定域名
- 部署记录与失败原因

### 监控与告警（MVP 简化）
- 控制台展示即将到期的证书

## 5. 非功能需求
- 安全：敏感凭据/证书私钥加密存储
- 可观测性：基础日志 + 任务执行日志
- 可扩展：插件化证书提供方与 CDN 提供方

## 6. 技术方案
- 前端：React + Vite + TypeScript + Tailwind + shadcn 风格组件 + Yarn
- 后端：Node.js + TypeScript + Fastify
- 数据库：SQLite（本地/单机），可扩展至 Postgres
- 任务调度：Node Cron
- 证书申请：ACME (Let's Encrypt) + Self-signed（开发环境）
- CDN SDK：腾讯云官方 SDK、七牛云官方 SDK
- 安全：凭据与证书私钥采用 AES-256-GCM 加密存储
- ACME 校验：HTTP-01 挑战，路径 `/.well-known/acme-challenge/:token`

## 7. 数据模型（MVP）
- users
- provider_credentials
- sites
- certificates
- deployments
- refresh_tokens

## 8. API（草案）
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me
- GET /sites
- POST /sites
- GET /sites/:id
- PATCH /sites/:id
- DELETE /sites/:id
- GET /providers
- POST /providers
- PATCH /providers/:id
- DELETE /providers/:id
- GET /providers/catalog
- POST /providers/:id/sync
- GET /certificates
- POST /certificates/issue
- POST /deployments
- GET /deployments

## 9. 验收标准
- 多开发者多网站可用
- 证书自动续签任务可运行
- CDN 部署流程具备成功/失败记录
- 前后端独立启动，完整跑通核心流程
- 测试覆盖关键逻辑（认证、站点、证书、部署）

## 10. 里程碑
- M1：项目结构 + Auth + 基础 API
- M2：证书申请/续签 + CDN 部署
- M3：前端控制台 + 测试 + 文档完善
