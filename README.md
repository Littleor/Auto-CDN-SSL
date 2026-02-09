# Auto CDN SSL（auto-ssl）

中文 | [English](./README.en.md)

面向 CDN 场景的 SSL 证书自动化平台：统一管理多域名证书的**申请 / 续签 / 部署**，让“证书到期”不再靠记忆。

- 证书来源：Let’s Encrypt（ACME）/ 自签（开发环境）
- 验证方式：HTTP-01 / DNS-01（DNS-01 目前支持腾讯云 DNS）
- 部署目标：腾讯云 CDN、七牛云 CDN

线上站点: [https://auto-cdn-ssl.littleor.cn](https://auto-cdn-ssl.littleor.cn)

![Home](assets/Screenshot-homepage.png)
![Site](assets/Screenshot-site-list.png)

## 我们解决了什么问题

CDN 域名多、证书多时，常见痛点是：

- 证书到期分散在不同平台，难以及时发现
- 人工续签 + 上传证书容易漏，风险不可控
- 失败原因不透明（到底是验证、签发还是部署失败）

Auto CDN SSL 把证书生命周期变成一条可观测的流水线：

1. 到期前自动续签（可配置提前天数与执行时间）
2. 续签成功后（可选）自动部署到 CDN
3. 控制台沉淀全量记录：站点、证书、任务日志、部署历史与失败原因

## 特性

- **集中管理**：站点/域名、证书列表与到期时间、续签任务、部署记录
- **自动续签 + 手动触发**：定时续签；必要时可一键手动续签/部署
- **域名验证**：按顶级域名配置 HTTP-01 / DNS-01
  - HTTP-01：提供 `/.well-known/acme-challenge/:token`
  - DNS-01：自动写入 `_acme-challenge` TXT（腾讯云 DNS）
- **CDN 部署**：一键部署或续签后自动部署到腾讯云 CDN / 七牛云 CDN
- **站点同步**：从云厂商同步在用域名、HTTPS 状态与当前证书信息，自动生成/更新站点
- **安全设计**：云厂商凭据与私钥 AES-256-GCM 加密存储（`DATA_ENCRYPTION_KEY`）
- **多用户**：注册/登录/刷新 Token；SMTP 邮箱验证

## 快速开始（自托管试用）

> 下面用于快速跑通流程；生产部署请看「自托管部署」一节。

### 依赖

- Node.js 20+
- MySQL 8+（或兼容 MySQL 的服务）
- SMTP（用于注册邮箱验证）

### 1) 安装

```bash
yarn install
```

### 2) 配置

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

后端 `.env` 至少需要正确填写：

- `MYSQL_*`
- `SMTP_*` + `FROM_EMAIL`
- `WEB_BASE_URL`
- `JWT_SECRET`
- `DATA_ENCRYPTION_KEY`

### 3) 启动

```bash
yarn dev
```

- 控制台：`http://localhost:5173`
- API：`http://localhost:4000/health`

## 怎么用（控制台）

1. 注册并完成邮箱验证后登录
2. 在「凭据」新增：
   - CDN 凭据：腾讯云 `tencent` / 七牛 `qiniu`
   - DNS 凭据（可选）：腾讯云 DNS `tencent_dns`（用于 DNS-01）
3. 在「域名验证」按顶级域名设置验证方式：
   - HTTP-01：需要域名的 `80` 端口可访问到 `/.well-known/acme-challenge/*`
   - DNS-01（推荐）：选择腾讯云 DNS 凭据，系统会自动写入 TXT 并等待生效
4. 创建站点并绑定 CDN 凭据，开启自动续签（可选）
5. 触发「续签」与「部署」，或等待定时任务自动执行

提示：CDN 场景通常推荐 DNS-01（不依赖暴露 80 端口）。

## 自托管部署（生产）

- 部署方案（PM2 + Nginx）：[`docs/DEPLOY_PM2_NGINX.md`](./docs/DEPLOY_PM2_NGINX.md)

## 运行与安全注意

- **只跑一个后端实例**：项目包含定时续签任务，避免多实例重复执行。
- **持久化 ACME 账号**：`apps/backend/data/acme-account.json` 保存 ACME 账号私钥，生产环境务必持久化/备份。
- **密钥不可随意轮换**：更换 `DATA_ENCRYPTION_KEY` 会导致历史数据无法解密；更换 `JWT_SECRET` 会使已签发 Token 失效。
- **建议先用 staging**：初次联调建议先把 `ACME_DIRECTORY_URL` 指向 staging，确认流程无误再切换 production，避免触发 Let’s Encrypt 限额。

## 文档

- 部署：[`docs/DEPLOY_PM2_NGINX.md`](./docs/DEPLOY_PM2_NGINX.md)
- 产品说明（PRD）：[`docs/PRD.md`](./docs/PRD.md)

## Roadmap

欢迎提 Issue / PR，共同完善更多 DNS/CDN Provider 与部署形态。
