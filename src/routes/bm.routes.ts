// ─── Branch Manager Routes ────────────────────────────────────────────────────
// All routes here require a valid JWT token with the BRANCH_MANAGER role.
// Branch managers oversee their own branch: they can view sales, all orders,
// staff members, menu items, and table info — but only for their own branch.
// The branchId is automatically read from the JWT token (no need to pass it in the URL).

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication and BRANCH_MANAGER role check to all routes in this file
router.use(authenticate, authorize('BRANCH_MANAGER'));

// ── GET /api/bm/sales ─────────────────────────────────────────────────────────
// Returns total sales revenue and all paid orders for the manager's branch.
// Supports optional date filtering via query params:
//   ?startDate=2026-01-01   (only orders on or after this date)
//   ?endDate=2026-12-31     (only orders on or before this date)
// Both params are optional — omitting them returns all-time sales.
// Returns: { branchId, totalRevenue, orderCount, orders[] }
router.get('/sales', async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
  const branchId = req.user.branchId as number; // From JWT — manager's own branch
  try {
    // Build a dynamic "where" filter for Prisma
    const where: Record<string, unknown> = { branchId, status: 'PAID' }; // Only paid orders count as revenue

    // Add date range filter if either date was provided
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate); // Greater than or equal to startDate
      if (endDate)   (where.createdAt as Record<string, Date>).lte = new Date(endDate);   // Less than or equal to endDate
    }

    const orders = await prisma.order.findMany({ where, include: { receipt: true } });

    // Sum up totalPrice from all matching orders
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({ branchId, totalRevenue, orderCount: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/bm/orders ────────────────────────────────────────────────────────
// Returns ALL orders at the manager's branch (all statuses: PENDING through PAID).
// Newest orders appear first (most recent at the top).
// Useful for a full order history view on the Branch Manager dashboard.
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const orders = await prisma.order.findMany({
      where:   { branchId },
      include: { table: true, orderItems: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' }, // Newest first
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/bm/staff ─────────────────────────────────────────────────────────
// Returns all staff members assigned to the manager's branch.
// Password is excluded — only safe fields (id, name, email, role) are returned.
router.get('/staff', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const staff = await prisma.user.findMany({
      where:  { branchId },
      select: { id: true, name: true, email: true, role: true }, // Never expose password hashes
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/bm/menu ──────────────────────────────────────────────────────────
// Returns all menu items for the manager's branch (including unavailable ones).
// The branch manager needs a complete view for oversight.
router.get('/menu', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const menu = await prisma.menuItem.findMany({ where: { branchId } });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/bm/tables ────────────────────────────────────────────────────────
// Returns all tables at the manager's branch.
// Useful for table occupancy overview and floor plan management.
router.get('/tables', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const tables = await prisma.table.findMany({ where: { branchId } });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
