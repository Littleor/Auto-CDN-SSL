# Auto CDN SSL

An open-source platform dedicated to CDN SSL certificate automation (Tencent CDN / Qiniu CDN), providing visual management, automatic renewals, and one-click deployment to reduce the operational cost of HTTPS on CDN.

- 中文（默认）: `README.md`
- English

## Key Features
- Automatic CDN SSL renewal and expiry alerts
- Auto-deploy to CDN after renewal (global toggle)
- HTTP-01 / DNS-01 validation (Tencent DNS)
- Sync CDN sites and statuses from provider credentials
- Visualized certificate, deployment, and job status
- SMTP-based email verification during signup

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind + shadcn-style UI
- Backend: Node.js + TypeScript + Fastify
- Database: MySQL

## Project Structure
- `apps/backend`: Backend service (Fastify + MySQL)
- `apps/frontend`: Admin console (React + Vite)
- `docs/PRD.md`: Product requirements (Chinese)

## Quick Start

### All-in-one (frontend + backend)
```bash
cd /Users/littleor/Project/Interest/auto-ssl
yarn dev
```

### Backend
```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/backend
cp .env.example .env
# Fill JWT_SECRET, DATA_ENCRYPTION_KEY, and MySQL connection details

cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace auto-ssl-backend dev
```

### Frontend
```bash
cd /Users/littleor/Project/Interest/auto-ssl/apps/frontend
cp .env.example .env
# Update VITE_API_URL if needed

cd /Users/littleor/Project/Interest/auto-ssl
yarn workspace frontend dev
```

## Environment Variables

### Backend (`apps/backend/.env`)
- `JWT_SECRET`: JWT secret (required)
- `DATA_ENCRYPTION_KEY`: AES-256-GCM key for credential encryption (required)
- `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE`: MySQL connection (required)
- `ACME_DIRECTORY_URL`: ACME directory URL (default: Let’s Encrypt)
- `ACME_ACCOUNT_EMAIL`: ACME account email (optional; falls back to user signup email)
- `ACME_HTTP_HOST` / `ACME_HTTP_PORT`: HTTP-01 challenge config (optional)
- `ACME_SKIP_LOCAL_VERIFY`: Skip local verify (optional)
- `ACME_DNS_WAIT_SECONDS` / `ACME_DNS_TTL`: DNS-01 timing settings (optional)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `FROM_EMAIL`: SMTP config (required)

### Frontend (`apps/frontend/.env`)
- `VITE_API_URL`: API base URL (default `http://localhost:4000`)
- `VITE_ANALYTICS_SNIPPET`: Analytics snippet injection (optional)

## ACME Notes
- ACME account email defaults to the current user’s registered email
- Other ACME parameters are read from backend environment variables

## DNS-01 Validation (Tencent DNS)
1. Create a `Tencent DNS` credential under "DNS Credentials"
2. Or reuse your Tencent CDN credential
3. Configure validation by apex domain in "Domain Verification"
4. When renewal is triggered, the system writes `_acme-challenge` TXT records automatically

## Tests
```bash
yarn workspace auto-ssl-backend test
yarn workspace frontend build
```

## Commit Convention
- Use `feat: ...` / `fix: ...` / `chore: ...`
- One commit per feature; do not auto-push

## License
- Not specified yet (add one if you plan to open-source)
