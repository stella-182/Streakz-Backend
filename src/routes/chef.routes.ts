import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { OrderStatus } from '../types';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, authorize('CHEF'));

// GET /api/chef/orders
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const orders = await prisma.order.findMany({
      where: { branchId, status: { in: ['PENDING', 'PREPARING'] } },
      include: { table: true, orderItems: { include: { menuItem: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PUT /api/chef/orders/:id/status
router.put('/orders/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body as { status: OrderStatus };
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/chef/menu
router.get('/menu', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const menu = await prisma.menuItem.findMany({ where: { branchId } });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/chef/menu
router.post('/menu', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  const { name, description, price, category } = req.body as {
    name: string; description?: string; price: number; category: string;
  };
  try {
    const item = await prisma.menuItem.create({
      data: { name, description, price, category, branchId },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PUT /api/chef/menu/:id
router.put('/menu/:id', async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, category, isAvailable } = req.body as {
    name?: string; description?: string; price?: number; category?: string; isAvailable?: boolean;
  };
  try {
    const item = await prisma.menuItem.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, price, category, isAvailable },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// DELETE /api/chef/menu/:id
router.delete('/menu/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.menuItem.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;