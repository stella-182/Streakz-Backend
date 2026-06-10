import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/open/menu
router.get('/menu', async (_req: Request, res: Response): Promise<void> => {
  try {
    const menu = await prisma.menuItem.findMany({ where: { isAvailable: true } });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/open/menu/:branchId
router.get('/menu/:branchId', async (req: Request, res: Response): Promise<void> => {
  try {
    const menu = await prisma.menuItem.findMany({
      where: { branchId: parseInt(req.params.branchId), isAvailable: true },
    });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/open/promotions
router.get('/promotions', async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const promos = await prisma.promotion.findMany({
      where: { startDate: { lte: now }, endDate: { gte: now } },
    });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/open/branches
router.get('/branches', async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/open/tables/:branchId
router.get('/tables/:branchId', async (req: Request, res: Response): Promise<void> => {
  try {
    const tables = await prisma.table.findMany({
      where: { branchId: parseInt(req.params.branchId) },
      orderBy: { number: 'asc' },
    });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/open/order
router.post('/order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId, tableNumber, items } = req.body as {
      branchId: number;
      tableNumber?: number | null;
      items: { menuItemId: number; quantity: number }[];
    };

    if (!branchId || !items || items.length === 0) {
      res.status(400).json({ message: 'branchId and items are required' });
      return;
    }

    const isOnline = tableNumber == null;
    const lookupNumber = isOnline ? 0 : Number(tableNumber);

    let table = await prisma.table.findFirst({
      where: { branchId: Number(branchId), number: lookupNumber },
    });

    // For online orders, auto-create the virtual table if it doesn't exist yet
    if (!table && isOnline) {
      table = await prisma.table.create({
        data: { number: 0, seats: 0, branchId: Number(branchId) },
      });
    }

    if (!table) {
      res.status(404).json({ message: `Table ${lookupNumber} not found at this branch. Please ask a member of staff.` });
      return;
    }

    // Fetch menu items to calculate prices
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } });

    const totalPrice = items.reduce((sum, i) => {
      const mi = menuItems.find((m) => m.id === i.menuItemId);
      return sum + (mi?.price ?? 0) * i.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        branchId: table.branchId,
        totalPrice,
        status: 'PENDING',
        orderItems: {
          create: items.map((i) => {
            const mi = menuItems.find((m) => m.id === i.menuItemId);
            return {
              menuItemId: i.menuItemId,
              quantity: i.quantity,
              price: mi?.price ?? 0,
            };
          }),
        },
      },
      include: { orderItems: { include: { menuItem: true } }, table: true },
    });

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;