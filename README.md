# Unique Item Marketplace Backend

Tech: Node.js, Express, Sequelize (MySQL 5.7), JWT, Socket.io, Multer, Rate Limit, CORS, dotenv.

## Setup
1. Copy .env.example to .env and adjust DB settings.
2. Install deps: `npm install`.
3. Run dev server: `npm run dev`.

The DB will auto-sync and seed an admin user (admin@example.com / admin123) and one demo product.

## Scripts
- `npm run dev` – start with nodemon
- `npm start` – start server

## Endpoints
See route groups under `/api`: auth, admin, products, marketplace, auctions, trades, messages, wallet.
