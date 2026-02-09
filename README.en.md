# Auto CDN SSL

A CDN-focused SSL certificate automation platform (Tencent CDN / Qiniu CDN).

Auto CDN SSL is built to reduce the operational cost and risk of managing CDN HTTPS certificates at scale: renew before expiry, optionally auto-deploy the renewed certificate to your CDN, and keep everything observable with site status, jobs, and deployment history.

中文: [README.md](README.md)

## Use Cases
- Your certificates are used on CDN (Tencent/Qiniu) and you want automated renewal + deployment
- You manage many domains and manual renewal/deployment is error-prone
- You want centralized visibility for credentials, certificate lifecycle, and deployments

## Key Features
- Scheduled renewals before expiry (threshold/time configurable)
- One-click renewal from the console
- Auto-deploy to CDN after renewal (global toggle)
- Domain validation: HTTP-01 / DNS-01 (Tencent DNS; can reuse Tencent CDN credentials)
- Site sync: import domains and statuses from CDN providers
- Observability: sites, certificates, deployments, job status
- SMTP-based email verification for signup

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + TypeScript + Fastify
- Database: MySQL

## Repository Layout
- `apps/backend`: Backend service (Fastify + MySQL)
- `apps/frontend`: Web console (React + Vite)
- `docs/PRD.md`: Product requirements (Chinese)

## Quick Start (Local)

### Prerequisites
- Node.js 20+ (recommended)
- Yarn 1 (this repo uses Yarn Workspaces)
- MySQL 8+ (or a MySQL-compatible service)

### Install
```bash
yarn
```

### Configure Environment Variables
Backend:
```bash
cp apps/backend/.env.example apps/backend/.env
```

Frontend:
```bash
cp apps/frontend/.env.example apps/frontend/.env
```

`.env` files are gitignored by default. Never commit secrets.

### Run (frontend + backend)
```bash
yarn dev
```

- Backend default: `http://localhost:4000`
- Frontend default: `http://localhost:5173`
- API docs (dev): `http://localhost:4000/docs`

## Environment Variables
Use the examples as the source of truth: `apps/backend/.env.example`, `apps/frontend/.env.example`.

### Backend (Required)
- `JWT_SECRET`: JWT secret (min length 16)
- `DATA_ENCRYPTION_KEY`: encryption key for stored credentials/private keys (rotating it will break decryption of existing data)
- `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `FROM_EMAIL`
- `WEB_BASE_URL`: used to generate the email verification link (e.g. `http://localhost:5173`)

### Backend (Optional / Defaults)
- `CRON_SCHEDULE`: renewal cron expression (default `0 3 * * *`)
- `RENEWAL_THRESHOLD_DAYS`: default renewal threshold in days (used when user has no override)
- `ACME_DIRECTORY_URL`: ACME directory URL (default Let’s Encrypt)
- `ACME_SKIP_LOCAL_VERIFY` / `ACME_DNS_WAIT_SECONDS` / `ACME_DNS_TTL`

### Frontend
- `VITE_API_URL`: backend URL (default `http://localhost:4000`)
- `VITE_ANALYTICS_SNIPPET`: optional analytics injection (`<script ...></script>`)

## ACME and Domain Validation
- ACME account email: defaults to the current user’s signup email (no console control needed)
- HTTP-01: challenge path is `/.well-known/acme-challenge/:token` and must be reachable publicly (typically requires port 80)
- DNS-01 (recommended): configure Tencent DNS credentials; the system writes `_acme-challenge` TXT records automatically

## Renewal & Deployment Policy
- Renewal time, threshold, and auto-deploy toggle are configured per user in the “Renewal Settings” page
- When auto-deploy is enabled, renewed certificates will be deployed to the bound CDN provider credential

## Tests
```bash
yarn test
yarn build
```

## Production Deployment
- PM2 + Nginx: see `docs/DEPLOY_PM2_NGINX.md`

## Security Notes
- Provider credentials and private keys are stored encrypted using AES-256-GCM (`DATA_ENCRYPTION_KEY`)
- Protect `JWT_SECRET`, `DATA_ENCRYPTION_KEY`, SMTP credentials, and CDN/DNS secrets

## Contributing
Issues and PRs are welcome:
- For bugs, include reproduction steps and logs
- For features, please align with PRD or discuss in an Issue first
# Auto CDN SSL (auto-ssl)

English | [中文](./README.md)

An SSL automation platform for CDN scenarios: manage multiple sites, issue/renew certificates (Let's Encrypt / ACME), and deploy to CDN providers (currently Tencent Cloud CDN and Qiniu). Sensitive credentials and private keys are encrypted at rest.

## What you can do with it

- Issue and renew certificates for multiple domains/sites (Let's Encrypt / ACME)
- Configure validation per apex domain: HTTP-01 / DNS-01 (DNS-01 currently supports Tencent Cloud DNS)
- Deploy certificates to CDN (Tencent Cloud / Qiniu)
- Dashboard for expiry, renewal/deployment history, and failure reasons
- Scheduler: auto-renew X days before expiry, plus manual trigger

## Repository layout

- `apps/backend`: Fastify + MySQL backend (API, scheduler, ACME challenge callback)
- `apps/frontend`: React + Vite web console
- `docs/PRD.md`: product requirements (Chinese)

## Quick start (local development)

### Prerequisites

- Node.js 18+ (recommended 20+)
- Yarn 1.x (Yarn workspaces)
- MySQL (recommended 8.0+)
- SMTP server (required for email verification on signup)

### 1) Install dependencies

```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn
```

### 2) Configure backend environment variables

```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/backend
cp .env.example .env
```

At minimum, set these (you can keep the rest as defaults initially):

- `JWT_SECRET`: JWT signing secret (use a long random string)
- `DATA_ENCRYPTION_KEY`: encrypts sensitive data at rest (do not change after you have data)
- `MYSQL_*`: MySQL connection (make sure the database exists)
- `SMTP_*` + `FROM_EMAIL`: for sending verification emails
- `WEB_BASE_URL`: frontend base URL used to generate the verification link (defaults to `http://localhost:5173`)

See the full example: `apps/backend/.env.example`.

### 3) Configure frontend environment variables

```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/frontend
cp .env.example .env
```

Defaults are fine for local dev (`VITE_API_URL=http://localhost:4000`). See: `apps/frontend/.env.example`.

### 4) Start both backend & frontend

```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn dev
```

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/health`
- Backend API docs (enabled only when `NODE_ENV` is not `production`): `http://localhost:4000/docs`

## How to use (from the web console)

1. Open the web console and register an account (a verification email will be sent)
2. Verify your email via the link, then log in
3. Create credentials:
   - CDN credentials: `tencent` (Tencent Cloud CDN) or `qiniu` (Qiniu CDN)
   - (Optional) DNS credentials: `tencent_dns` (for DNS-01)
4. Configure domain validation per apex domain:
   - HTTP-01: the domain’s port 80 must reach this service’s `/.well-known/acme-challenge/*`
   - DNS-01: requires Tencent DNS credentials and DNS propagation wait time
5. Create a site, choose certificate source (Let’s Encrypt / self-signed), bind CDN credentials, enable auto-renew/auto-deploy
6. Trigger issue/renew + deploy manually, or let the scheduler do it automatically

> Tip: For CDN domains, DNS-01 is usually the easiest option (no dependency on port 80 reachability).

## Deploy separately (production/self-hosting)

This project is designed for a split deployment: a static frontend, a Node backend, and a MySQL database.

### Deploy backend (Fastify)

1) Build

```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace auto-ssl-backend build
```

2) Configure environment variables (keep them stable across restarts)

- `DATA_ENCRYPTION_KEY`: do not change once data exists
- `JWT_SECRET`: rotating it invalidates existing tokens
- `ACME_DIRECTORY_URL`: use staging first; switch to production after validation

3) Start (recommended to run from `apps/backend` so `.env` and `data/` resolve correctly)

```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/backend
node dist/index.js
```

4) Persist the data directory (important)

- `apps/backend/data/acme-account.json`: ACME account private key (persist/backup it)

5) Reverse proxy for HTTP-01 (if you use HTTP-01)

Make sure the validated domain’s port `80` can reach:

- `/.well-known/acme-challenge/:token`

If your backend doesn’t listen on port 80 directly, forward that path at your gateway/Nginx (example):

```nginx
location ^~ /.well-known/acme-challenge/ {
  proxy_pass http://127.0.0.1:4000;
}
```

### Deploy frontend (React/Vite)

1) Set API base URL (Vite env vars are injected **at build time**)

- Update `VITE_API_URL` in `apps/frontend/.env`
  - e.g. `VITE_API_URL=https://api.example.com`

2) Build

```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace frontend build
```

Artifacts are in `apps/frontend/dist`. Serve it via Nginx or any static hosting.

### Database (MySQL)

- Ensure the `MYSQL_DATABASE` database exists
- Migrations run automatically on backend startup (tables will be created on first boot)

## More for developers

- Development notes: `docs/DEVELOPMENT.en.md`
