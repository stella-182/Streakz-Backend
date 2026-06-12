// ─── Waiter Routes ────────────────────────────────────────────────────────────
// All routes here require a valid JWT token with the WAITER role.
// Waiters can view tables, place orders on behalf of customers, and mark orders as delivered.
// The waiter's branchId from their JWT token is used automatically — they only see their branch.

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication and role check to ALL routes in this file.
// Any request without a valid WAITER token will be rejected before reaching the routes.
router.use(authenticate, authorize('WAITER'));

// ── GET /api/waiter/tables ────────────────────────────────────────────────────
// Returns all tables at the waiter's branch.
// Also includes the most recent active (non-PAID) order for each table,
// so the waiter can see which tables have open orders at a glance.
router.get('/tables', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number; // Extracted from JWT token
  try {
    const tables = await prisma.table.findMany({
      where: { branchId },
      include: {
        orders: {
          where:   { status: { notIn: ['PAID'] } }, // Only show active (unpaid) orders
          orderBy: { createdAt: 'desc' },           // Most recent order first
          take: 1,                                  // Only include the latest order per table
        },
      },
    });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/waiter/orders ────────────────────────────────────────────────────
// Returns all active (non-PAID) orders at the waiter's branch.
// Includes table info and full order item details so the waiter can see what was ordered.
// Orders are returned oldest first (so urgent orders appear at the top).
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const orders = await prisma.order.findMany({
      where: { branchId, status: { notIn: ['PAID'] } }, // Exclude completed/paid orders
      include: {
        table:      true,
        orderItems: { include: { menuItem: true } }, // Include menu item names and prices
      },
      orderBy: { createdAt: 'asc' }, // Oldest first — prioritise orders that came in first
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── POST /api/waiter/orders ───────────────────────────────────────────────────
// Places a new order on behalf of a customer at a table.
// Body: { tableId, items: [{ menuItemId, quantity }] }
// - tableId: the database ID of the table (not the table number)
// - items: what the customer wants to order
// Automatically calculates prices and assigns the order to the logged-in waiter.
router.post('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  const waiterId = req.user.id; // The logged-in waiter is recorded on the order
  const { tableId, items } = req.body as {
    tableId: number;
    items: { menuItemId: number; quantity: number }[];
  };

  try {
    // Fetch current prices for all ordered menu items
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i) => i.menuItemId) } },
    });

    // Build the order items array with prices looked up from the database
    const orderItems = items.map((i) => {
      const mi = menuItems.find((m) => m.id === i.menuItemId);
      if (!mi) throw new Error(`Menu item ${i.menuItemId} not found`);
      return { menuItemId: i.menuItemId, quantity: i.quantity, price: mi.price };
    });

    // Calculate the total price (sum of price × quantity for each item)
    const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Create the order in the database — status starts as PENDING (awaiting kitchen)
    const order = await prisma.order.create({
      data: {
        branchId,
        tableId,
        waiterId,       // Links this order to the waiter who placed it
        totalPrice,     // Correctly stored so cashier receipts show the right amount
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

// ── PUT /api/waiter/orders/:id/delivered ─────────────────────────────────────
// Marks an order as DELIVERED after the waiter has brought it to the table.
// This moves the order to the next stage: DELIVERED → ready for cashier to process.
router.put('/orders/:id/delivered', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) }, // Order ID from URL
      data:  { status: 'DELIVERED' },         // Update status to DELIVERED
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
