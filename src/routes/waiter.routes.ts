import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, authorize('WAITER'));

// GET /api/waiter/tables
router.get('/tables', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const tables = await prisma.table.findMany({
      where: { branchId },
      include: {
        orders: {
          where: { status: { notIn: ['PAID'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/waiter/orders
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const orders = await prisma.order.findMany({
      where: { branchId, status: { notIn: ['PAID'] } },
      include: { table: true, orderItems: { include: { menuItem: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/waiter/orders
router.post('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  const waiterId = req.user.id;
  const { tableId, items } = req.body as {
    tableId: number;
    items: { menuItemId: number; quantity: number }[];
  };
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i) => i.menuItemId) } },
    });

    const orderItems = items.map((i) => {
      const mi = menuItems.find((m) => m.id === i.menuItemId);
      if (!mi) throw new Error(`Menu item ${i.menuItemId} not found`);
      return { menuItemId: i.menuItemId, quantity: i.quantity, price: mi.price };
    });

    const order = await prisma.order.create({
      data: {
        branchId,
        tableId,
        waiterId,
        status: 'PENDING',
        orderItems: { create: orderItems },
      },
      include: { orderItems: { include: { menuItem: true } }, table: true },
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PUT /api/waiter/orders/:id/delivered
router.put('/orders/:id/delivered', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'DELIVERED' },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router