// ─── Server Entry Point ───────────────────────────────────────────────────────
// This is the main file that starts the Express server.
// It sets up middleware (CORS, JSON parsing) and registers all route groups.

import 'dotenv/config'; // Load environment variables from .env file (e.g. DATABASE_URL, JWT_SECRET)
import express from 'express';
import cors from 'cors';

// Import all route handlers — each file handles a group of related endpoints
import authRoutes    from './routes/auth.routes';    // Login / logout
import openRoutes    from './routes/open.routes';    // Public routes (no token needed)
import adminRoutes   from './routes/admin.routes';   // Admin: manage users & branches
import hmRoutes      from './routes/hm.routes';      // HQ Manager: all-branch reporting
import bmRoutes      from './routes/bm.routes';      // Branch Manager: branch-level reporting
import chefRoutes    from './routes/chef.routes';    // Chef: kitchen orders & menu management
import cashierRoutes from './routes/cashier.routes'; // Cashier: receipts & payment
import waiterRoutes  from './routes/waiter.routes';  // Waiter: tables & order placement

const app = express();

// ── CORS Configuration ────────────────────────────────────────────────────────
// CORS (Cross-Origin Resource Sharing) controls which domains can call this API.
// We allow requests from the frontend URL (set in Render environment variables)
// and localhost for local development.
const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173', // Production frontend URL from env
  'http://localhost:5173',                              // Local development frontend
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ── JSON Body Parser ──────────────────────────────────────────────────────────
// Allows Express to read JSON from request bodies (e.g. POST/PUT requests).
// Without this, req.body would be undefined.
app.use(express.json());

// ── Root ──────────────────────────────────────────────────────────────────────
// Shown when someone visits the backend URL directly in a browser.
app.get('/', (_req, res) => res.send('Streakz Restaurant — Backend Running ✅'));

// ── Health Check ──────────────────────────────────────────────────────────────
// Render.com pings this endpoint to check the server is running.
// Returns a simple { status: 'ok' } response.
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Route Registration ────────────────────────────────────────────────────────
// Each route group is mounted at a specific URL prefix.
// e.g. all routes in auth.routes.ts will be accessible at /api/auth/...
app.use('/api/auth',    authRoutes);    // POST /api/auth/login, POST /api/auth/logout
app.use('/api/open',    openRoutes);    // GET  /api/open/menu, /api/open/branches, etc.
app.use('/api/admin',   adminRoutes);   // GET/POST/PUT/DELETE /api/admin/users, /branches
app.use('/api/hm',      hmRoutes);      // GET /api/hm/branches, /sales, /performance, etc.
app.use('/api/bm',      bmRoutes);      // GET /api/bm/sales, /orders, /staff, etc.
app.use('/api/chef',    chefRoutes);    // GET/PUT /api/chef/orders, GET/POST/PUT/DELETE /menu
app.use('/api/cashier', cashierRoutes); // GET /api/cashier/orders, POST/GET /receipt
app.use('/api/waiter',  waiterRoutes);  // GET /api/waiter/tables, /orders, POST/PUT orders

// ── Start Server ──────────────────────────────────────────────────────────────
// Listen on the PORT provided by Render (or 5000 for local development).
const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
