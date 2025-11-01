import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { apiLimiter } from './middleware/rateLimit.js';
import errorHandler from './middleware/errorHandler.js';
import { initSocket } from './config/socket.js';
import { initDatabase } from './services/database-init.js';
import { startScheduler } from './services/scheduler.js';

import routes from './routes/index.js';
import userRoutes from './routes/user.routes.js';

const app = express();
const server = http.createServer(app);
initSocket(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean), credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api', apiLimiter, routes);
app.use('/api/users', userRoutes);

// Health check for uptime monitors and load balancers
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ success: false, error: 'Not Found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  await initDatabase({ seedDemo: true });
  startScheduler();
  server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
})();
