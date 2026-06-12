// ─── HQ Manager Routes ────────────────────────────────────────────────────────
// All routes here require a valid JWT token with the HQ_MANAGER role.
// HQ Managers have a company-wide view — unlike branch managers, they can see
// data across ALL branches, not just one.
// They use this data for strategy, performance monitoring, and reporting.

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication and HQ_MANAGER role check to all routes in this file
router.use(authenticate, authorize('HQ_MANAGER'));

// ── GET /api/hm/branches ──────────────────────────────────────────────────────
// Returns all branches with summary counts: how many orders and staff each has.
// _count is a Prisma feature that adds aggregate counts without fetching all records.
// Used on the HQ Manager dashboard to see an overview of all branches at a glance.
router.get('/branches', async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany({
      include: { _count: { select: { orders: true, users: true } } }, // Count orders & staff per branch
    });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/hm/sales ─────────────────────────────────────────────────────────
// Returns total sales figures across all branches (or filtered to one branch).
// Supports optional query parameters:
//   ?branchId=1            (filter to a specific branch)
//   ?startDate=2026-01-01  (only orders on or after this date)
//   ?endDate=2026-12-31    (only orders on or before this date)
// Returns: { totalRevenue, orderCount, orders[] }
// Each order includes its branch and receipt so the HM can see where revenue came from.
router.get('/sales', async (req: Request, res: Response): Promise<void> => {
  const { branchId, startDate, endDate } = req.query as Record<string, string | undefined>;
  try {
    // Build a dynamic Prisma filter — start with just status: PAID
    const where: Record<string, unknown> = { status: 'PAID' };

    // Optionally narrow to a specific branch
    if (branchId) where.branchId = parseInt(branchId);

    // Optionally filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      if (endDate)   (where.createdAt as Record<string, Date>).lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      include: { branch: true, receipt: true }, // Include branch name and receipt details
    });

    // Sum revenue across all matching orders
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);

    res.json({ totalRevenue, orderCount: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/hm/customers ─────────────────────────────────────────────────────
// Returns all orders (treated as "customer activity") across all branches,
// optionally filtered to a single branch via ?branchId=1.
// Useful for understanding customer ordering patterns and preferences.
// Each order includes its branch, table, and full item list.
router.get('/customers', async (req: Request, res: Response): Promise<void> => {
  const { branchId } = req.query as { branchId?: string };
  try {
    // If branchId is provided, filter; otherwise fetch all branches
    const where = branchId ? { branchId: parseInt(branchId) } : {};
    const orders = await prisma.order.findMany({
      where,
      include: { branch: true, table: true, orderItems: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' }, // Newest activity first
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/hm/performance ───────────────────────────────────────────────────
// Returns performance metrics for every branch: how many orders completed and total revenue.
// Runs a query per branch (using Promise.all for parallel execution).
// Used on the HM Performance page to compare branches side by side.
// Returns: [{ branch, totalOrders, totalRevenue }, ...]
router.get('/performance', async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany();

    // For each branch, count PAID orders and sum revenue — run all in parallel
    const performance = await Promise.all(
      branches.map(async (branch) => {
        const orders  = await prisma.order.findMany({ where: { branchId: branch.id, status: 'PAID' } });
        const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        return { branch, totalOrders: orders.length, totalRevenue: revenue };
      })
    );

    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/hm/users ─────────────────────────────────────────────────────────
// Returns all staff members across all branches, or filtered to one branch via ?branchId=1.
// Includes branch details alongside each user so the HM can see who works where.
// Password is excluded — only safe fields are returned.
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  const { branchId } = req.query as { branchId?: string };
  try {
    const where = branchId ? { branchId: parseInt(branchId) } : {};
    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, branchId: true, branch: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
