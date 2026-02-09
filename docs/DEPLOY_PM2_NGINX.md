# 生产部署（PM2 + Nginx）

下面以「前端静态资源由 Nginx 托管，后端 API 由 PM2 常驻运行」为例。

> 约定：
> - 前端域名：`console.example.com`
> - 后端仅监听本机：`127.0.0.1:4000`
> - Nginx 通过 `/api` 反代后端（前端构建时 `VITE_API_URL=/api`）

## 1) 服务器依赖

- Node.js 20+
- Yarn 1（建议用 Corepack）
- MySQL 8+
- Nginx
- PM2（`npm i -g pm2`）

## 2) 拉代码与安装依赖

```bash
git clone <your-repo-url> auto-ssl
cd auto-ssl
yarn install
```

## 3) 初始化 MySQL

创建数据库与账号（示例）：

```sql
CREATE DATABASE auto_ssl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'auto_ssl'@'127.0.0.1' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON auto_ssl.* TO 'auto_ssl'@'127.0.0.1';
FLUSH PRIVILEGES;
```

## 4) 配置环境变量

### 后端

```bash
cp apps/backend/.env.example apps/backend/.env
```

至少需要正确填写：

- `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `FROM_EMAIL`
- `WEB_BASE_URL=https://console.example.com`
- `JWT_SECRET`（>=16 位随机字符串）
- `DATA_ENCRYPTION_KEY`（建议 32 字节随机；**不要更换**，否则历史数据无法解密）

建议同时设置：

- `NODE_ENV=production`
- `HOST=127.0.0.1`
- `PORT=4000`
- `ACME_DIRECTORY_URL`：生产建议用 `https://acme-v02.api.letsencrypt.org/directory`（开发先用 staging 避免限额）

> 后端启动时会自动执行数据库迁移；也可以手动跑一次确认连接无误：
> `yarn workspace auto-ssl-backend migrate`

### 前端

前端构建时需要把 API 指向 Nginx 的反代路径：

```bash
VITE_API_URL=/api yarn workspace frontend build
```

构建产物在：`apps/frontend/dist`

## 5) 用 PM2 启动后端

仓库根目录已提供 `ecosystem.config.cjs`（默认把后端跑在 `127.0.0.1:4000`）：

```bash
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs auto-ssl-backend
```

开机自启（以 systemd 为例，按 PM2 提示执行）：

```bash
pm2 startup
pm2 save
```

## 6) 配置 Nginx

示例配置（请替换域名与路径）：

```nginx
server {
  listen 80;
  server_name console.example.com;

  # 前端静态资源（Vite build 输出）
  root /srv/auto-ssl/apps/frontend/dist;
  index index.html;

  # ACME HTTP-01 挑战（如果你使用 HTTP-01，需要保证 80 端口可达）
  location /.well-known/acme-challenge/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
  }

  # API 反代：把 /api/* 转发到后端 /*（注意 proxy_pass 末尾的 /）
  location /api/ {
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_pass http://127.0.0.1:4000/;
  }

  # SPA 路由：不存在的路径回退到 index.html
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

启用并重载：

```bash
nginx -t
systemctl reload nginx
```

> 如果你要给控制台域名上 HTTPS，可以用 `certbot`/云厂商证书等给 Nginx 配 TLS，然后把 `WEB_BASE_URL` 改成 `https://console.example.com`。

## 7) 验证

- 后端健康检查（本机）：`curl http://127.0.0.1:4000/health`
- 通过 Nginx 访问 API：`curl http://console.example.com/api/health`
- 浏览器访问前端：`http://console.example.com`

## 常见坑

- **前端白屏/请求 404**：确认 `VITE_API_URL=/api` 构建，并且 Nginx 的 `/api/` 配了 `proxy_pass .../`（末尾的 `/` 用来去掉 `/api` 前缀）。
- **HTTP-01 失败**：必须确保目标域名的 80 端口能访问到 `/.well-known/acme-challenge/*`，且该路径被 Nginx 反代到后端。
- **PM2 跑多个实例**：本项目包含定时续签任务（`node-cron`），建议只跑 1 个实例（`ecosystem.config.cjs` 已固定 `instances: 1`）。

