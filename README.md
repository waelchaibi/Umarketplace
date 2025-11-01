# Unique Item Marketplace Backend

Tech: Node.js, Express, Sequelize (MySQL 5.7), JWT, Socket.io, Multer, Rate Limit, CORS, dotenv.

## Setup (Backend)
1. Copy env.example to .env and adjust DB settings.
2. Install deps: `npm install`.
3. Run dev server: `npm run dev`.

The DB will auto-sync and seed an admin user (admin@example.com / admin123) and one demo product.

## Scripts
- `npm run dev` – start with nodemon
- `npm start` – start server

## Endpoints
See route groups under `/api`: auth, admin, products, marketplace, auctions, trades, messages, wallet.

## Frontend

Located in `frontend/` (Vite + React + TS). Development:

1. Copy `frontend/env.example` to `frontend/.env` and update values.
2. `cd frontend && npm install`
3. `npm run dev` (default on http://localhost:5173)

Env keys (build-time):

- `VITE_API_URL` (must end with `/api`)
- `VITE_APP_URL`
- `VITE_IMG_URL`
- `VITE_ROUTE_PREFIX`

## Health Check

`GET /api/health` returns `{ ok: true }` for uptime monitors and load balancers.

## Docker (local/prod-like)

Prereqs: Docker Desktop.

1. Build and start:
   - `docker-compose up -d --build`
2. Services:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - MySQL: 127.0.0.1:3306 (root/root, DB `unique_marketplace`)

Notes:

- `uploads/` is persisted via a volume. In production, prefer object storage (e.g. S3).
- Set `ALLOWED_ORIGINS` to the public frontend URL (e.g. `https://your-domain.com`).

## Cloud Deployment

Recommended setup:

- Backend on a container-friendly PaaS (e.g. Render, Railway, Fly.io) using the root `Dockerfile`.
- Managed MySQL (e.g. PlanetScale, RDS, Azure MySQL). Update DB env vars accordingly.
- Frontend on a static host (e.g. Vercel/Netlify) or as a container (use `frontend/Dockerfile`).

Frontend build settings (Vercel/Netlify):

- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Env: set `VITE_API_URL` to your backend public URL + `/api`

Backend env (examples):

- `NODE_ENV=production`
- `PORT=5000`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `ALLOWED_ORIGINS=https://your-frontend-domain.com`

Security/Operations:

- Rotate the seeded admin account or disable seeding (`initDatabase({ seedDemo: false })`).
- Consider replacing local uploads with S3 or similar in production.
