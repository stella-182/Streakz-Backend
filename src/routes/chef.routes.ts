// ─── Chef Routes ──────────────────────────────────────────────────────────────
// All routes here require a valid JWT token with the CHEF role.
// Chefs can view kitchen orders, update order statuses, and manage menu items.
// Like waiters, chefs only see data for their own branch (from JWT branchId).

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { OrderStatus } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication and CHEF role check to all routes in this file
router.use(authenticate, authorize('CHEF'));

// ── GET /api/chef/orders ──────────────────────────────────────────────────────
// Returns all orders that need kitchen attention at the chef's branch.
// Only shows PENDING and PREPARING orders — READY/DELIVERED/PAID are excluded
// as they no longer need kitchen action.
// Ordered oldest first so the chef knows which orders to prioritise.
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const orders = await prisma.order.findMany({
      where: {
        branchId,
        status: { in: ['PENDING', 'PREPARING'] }, // Only orders that need kitchen work
      },
      include: {
        table:      true,
        orderItems: { include: { menuItem: true } }, // Include item names so chef knows what to cook
      },
      orderBy: { createdAt: 'asc' }, // Oldest orders first (FIFO - first in, first out)
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── PUT /api/chef/orders/:id/status ──────────────────────────────────────────
// Updates the status of an order. Used by the chef to move orders through stages:
//   PENDING → PREPARING (chef starts cooking)
//   PREPARING → READY   (food is ready to be served)
// Body: { status: "PREPARING" | "READY" }
router.put('/orders/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body as { status: OrderStatus };
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) }, // Order ID from URL parameter
      data:  { status },                      // New status from request body
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/chef/menu ────────────────────────────────────────────────────────
// Returns all menu items for the chef's branch (including unavailable ones).
// Chefs need to see everything so they can enable/disable items as needed.
router.get('/menu', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  try {
    const menu = await prisma.menuItem.findMany({ where: { branchId } });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── POST /api/chef/menu ───────────────────────────────────────────────────────
// Adds a new item to the branch's menu.
// Body: { name, description?, price, category }
// The item is automatically assigned to the chef's branch and marked as available.
router.post('/menu', async (req: Request, res: Response): Promise<void> => {
  const branchId = req.user.branchId as number;
  const { name, description, price, category } = req.body as {
    name: string; description?: string; price: number; category: string;
  };
  try {
    const item = await prisma.menuItem.create({
      data: { name, description, price, category, branchId },
      // isAvailable defaults to true (new items are available immediately)
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── PUT /api/chef/menu/:id ────────────────────────────────────────────────────
// Updates an existing menu item. All fields are optional — only send what you want to change.
// Body: { name?, description?, price?, category?, isAvailable? }
// Common use: set isAvailable=false when an item runs out, or update price.
router.put('/menu/:id', async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, category, isAvailable } = req.body as {
    name?: string; description?: string; price?: number; category?: string; isAvailable?: boolean;
  };
  try {
    const item = await prisma.menuItem.update({
      where: { id: parseInt(req.params.id) },       // Menu item ID from URL
      data:  { name, description, price, category, isAvailable }, // Only updates provided fields
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── DELETE /api/chef/menu/:id ─────────────────────────────────────────────────
// Permanently removes a menu item from the database.
// Use with caution — consider setting isAvailable=false instead if the item may return.
router.delete('/menu/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.menuItem.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
