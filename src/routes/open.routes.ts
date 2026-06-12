// ─── Open / Public Routes ─────────────────────────────────────────────────────
// These routes are accessible WITHOUT a JWT token.
// They are used by the public-facing pages of the website (menu, branches, etc.)
// and by customers placing online orders.

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient(); // Database client

// ── GET /api/open/menu ────────────────────────────────────────────────────────
// Returns ALL available menu items across all branches.
// Only returns items where isAvailable = true (unavailable items are hidden).
router.get('/menu', async (_req: Request, res: Response): Promise<void> => {
  try {
    const menu = await prisma.menuItem.findMany({ where: { isAvailable: true } });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/open/menu/:branchId ──────────────────────────────────────────────
// Returns available menu items for a SPECIFIC branch.
// Used on the branch detail page to show what that branch serves.
router.get('/menu/:branchId', async (req: Request, res: Response): Promise<void> => {
  try {
    const menu = await prisma.menuItem.findMany({
      where: {
        branchId: parseInt(req.params.branchId), // Convert URL param from string to number
        isAvailable: true,
      },
    });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/open/promotions ──────────────────────────────────────────────────
// Returns all ACTIVE promotions (where today's date falls between startDate and endDate).
// Used on the Promotions page to show current deals to customers.
router.get('/promotions', async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const promos = await prisma.promotion.findMany({
      where: {
        startDate: { lte: now }, // startDate <= now (promotion has started)
        endDate:   { gte: now }, // endDate   >= now (promotion hasn't ended yet)
      },
    });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/open/branches ────────────────────────────────────────────────────
// Returns all branches (name, city, address).
// Used on the Branches page and in the login form's branch selector.
router.get('/branches', async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/open/tables/:branchId ────────────────────────────────────────────
// Returns all tables at a specific branch, ordered by table number.
// Used when a customer selects a table number while placing an order.
router.get('/tables/:branchId', async (req: Request, res: Response): Promise<void> => {
  try {
    const tables = await prisma.table.findMany({
      where:   { branchId: parseInt(req.params.branchId) },
      orderBy: { number: 'asc' }, // Sort tables numerically (1, 2, 3...)
    });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── POST /api/open/order ──────────────────────────────────────────────────────
// Places a new dine-in order — used by customers on the website (no login required).
// Body: { branchId, tableNumber, items: [{ menuItemId, quantity }] }
// - tableNumber: required — the physical table number the customer is sitting at
// - items: array of menu items and quantities the customer wants to order
// Calculates the total price automatically from the menu item prices.
router.post('/order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId, tableNumber, items } = req.body as {
      branchId: number;
      tableNumber: number;
      items: { menuItemId: number; quantity: number }[];
    };

    // Validate required fields — tableNumber is now mandatory (dine-in only)
    if (!branchId || tableNumber == null || !items || items.length === 0) {
      res.status(400).json({ message: 'branchId, tableNumber, and items are required' });
      return;
    }

    // Find the table in the database by its number and branch
    const table = await prisma.table.findFirst({
      where: { branchId: Number(branchId), number: Number(tableNumber) },
    });

    // If the table doesn't exist, return an error
    if (!table) {
      res.status(404).json({ message: `Table ${tableNumber} not found at this branch. Please ask a member of staff.` });
      return;
    }

    // Fetch menu item details (specifically prices) for all ordered items
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } });

    // Calculate the total price by multiplying each item's price by its quantity
    const totalPrice = items.reduce((sum, i) => {
      const mi = menuItems.find((m) => m.id === i.menuItemId);
      return sum + (mi?.price ?? 0) * i.quantity;
    }, 0);

    // Create the order and all its order items in the database in one transaction
    const order = await prisma.order.create({
      data: {
        tableId:    table.id,
        branchId:   table.branchId,
        totalPrice,
        status:     'PENDING', // New orders always start as PENDING
        orderItems: {
          create: items.map((i) => {
            const mi = menuItems.find((m) => m.id === i.menuItemId);
            return {
              menuItemId: i.menuItemId,
              quantity:   i.quantity,
              price:      mi?.price ?? 0, // Store price at time of order (prices may change later)
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
