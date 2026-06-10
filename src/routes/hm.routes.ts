import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, authorize('HQ_MANAGER'));

// GET /api/hm/branches
router.get('/branches', async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany({
      include: { _count: { select: { orders: true, users: true } } },
    });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/hm/sales
router.get('/sales', async (req: Request, res: Response): Promise<void> => {
  const { branchId, startDate, endDate } = req.query as Record<string, string | undefined>;
  try {
    const where: Record<string, unknown> = { status: 'PAID' };
    if (branchId) where.branchId = parseInt(branchId);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate);
    }
    const orders = await prisma.order.findMany({
      where,
      include: { branch: true, receipt: true },
    });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
    res.json({ totalRevenue, orderCount: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/hm/customers
router.get('/customers', async (req: Request, res: Response): Promise<void> => {
  const { branchId } = req.query as { branchId?: string };
  try {
    const where = branchId ? { branchId: parseInt(branchId) } : {};
    const orders = await prisma.order.findMany({
      where,
      include: { branch: true, table: true, orderItems: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/hm/performance
router.get('/performance', async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany();
    const performance = await Promise.all(
      branches.map(async (branch) => {
        const orders = await prisma.order.findMany({
          where: { branchId: branch.id, status: 'PAID' },
        });
        const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        return { branch, totalOrders: orders.length, totalRevenue: revenue };
      })
    );
    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/hm/users
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