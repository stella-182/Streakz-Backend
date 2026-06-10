import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, authorize('BRANCH_MANAGER'));

// GET /api/bm/sales
router.get('/sales', async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
  const branchId = req.user.branchId as number;
  try {
    const where: Record<string, unknown> = { branchId, status: 'PAID' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate);
    }
    const orders = await prisma.order.findMany({ where, include: { receipt: true } });
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    res.json({ branchId, totalRevenue, orderCount: orders.length, orders });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/bm/orders
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const orders = await prisma.order.findMany({
      where: { branchId },
      include: { table: true, orderItems: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/bm/staff
router.get('/staff', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const staff = await prisma.user.findMany({
      where: { branchId },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/bm/menu
router.get('/menu', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const menu = await prisma.menuItem.findMany({ where: { branchId } });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/bm/tables
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