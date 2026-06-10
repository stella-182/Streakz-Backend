import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import openRoutes from './routes/open.routes';
import adminRoutes from './routes/admin.routes';
import hmRoutes from './routes/hm.routes';
import bmRoutes from './routes/bm.routes';
import chefRoutes from './routes/chef.routes';
import cashierRoutes from './routes/cashier.routes';
import waiterRoutes from './routes/waiter.routes';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'http://localhost:5173',
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Health check — Render uses this to verify the service is up
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/open', openRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hm', hmRoutes);
app.use('/api/bm', bmRoutes);
app.use('/api/chef', chefRoutes);
app.use('/api/cashier', cashierRoutes);
app.use('/api/waiter', waiterRoutes);

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));