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

## Security Notes
- Provider credentials and private keys are stored encrypted using AES-256-GCM (`DATA_ENCRYPTION_KEY`)
- Protect `JWT_SECRET`, `DATA_ENCRYPTION_KEY`, SMTP credentials, and CDN/DNS secrets

## Contributing
Issues and PRs are welcome:
- For bugs, include reproduction steps and logs
- For features, please align with PRD or discuss in an Issue first
