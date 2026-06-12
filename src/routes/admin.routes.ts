// ─── Admin Routes ─────────────────────────────────────────────────────────────
// All routes here require a valid JWT token with the ADMIN role.
// Admins have the highest level of access: they can create, update, and delete
// both users and branches across the entire system.
// Only the admin (typically a developer/owner) should have this role.

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';    // For hashing passwords before storing
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication and ADMIN role check to all routes in this file
router.use(authenticate, authorize('ADMIN'));

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Returns all users in the system (all roles, all branches).
// Password is excluded — only safe fields are returned.
router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, branchId: true }, // Never return password
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── POST /api/admin/users ─────────────────────────────────────────────────────
// Creates a new user account.
// Body: { name, email, password, role, branchId? }
// - branchId is optional: ADMIN and HQ_MANAGER don't belong to a branch
// - Password is hashed with bcrypt (cost factor 10) before saving — never stored in plain text
// Returns the new user's id, name, and role (not the password).
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, branchId } = req.body as {
    name: string; email: string; password: string; role: Role; branchId?: number;
  };
  try {
    // Hash the password before saving (bcrypt salt rounds = 10, industry standard)
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, branchId: branchId ?? null },
    });
    // Only return safe fields — never return the hashed password
    res.status(201).json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── PUT /api/admin/users/:id ──────────────────────────────────────────────────
// Updates a user's role and/or branch assignment.
// Body: { role, branchId? }
// Useful for promoting a waiter to a cashier, or reassigning staff to a different branch.
// Note: password and name cannot be changed via this endpoint.
router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  const { role, branchId } = req.body as { role: Role; branchId?: number };
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },          // User to update (from URL)
      data:  { role, branchId: branchId ?? null },     // New role and/or branch
    });
    res.json({ id: user.id, role: user.role, branchId: user.branchId });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
// Permanently deletes a user from the system.
// This is irreversible — use with caution.
router.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── GET /api/admin/branches ───────────────────────────────────────────────────
// Returns all branches (name, city, address).
// Admins use this to see all locations before adding/updating/deleting one.
router.get('/branches', async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── POST /api/admin/branches ──────────────────────────────────────────────────
// Creates a new restaurant branch.
// Body: { name, city, address }
// After creation, staff and menu items can be assigned to the new branch.
router.post('/branches', async (req: Request, res: Response): Promise<void> => {
  const { name, city, address } = req.body as { name: string; city: string; address: string };
  try {
    const branch = await prisma.branch.create({ data: { name, city, address } });
    res.status(201).json(branch);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── PUT /api/admin/branches/:id ───────────────────────────────────────────────
// Updates a branch's name, city, or address.
// Body: { name, city, address }
// All three fields are required — send current values for fields you don't want to change.
router.put('/branches/:id', async (req: Request, res: Response): Promise<void> => {
  const { name, city, address } = req.body as { name: string; city: string; address: string };
  try {
    const branch = await prisma.branch.update({
      where: { id: parseInt(req.params.id) }, // Branch to update (from URL)
      data:  { name, city, address },
    });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── DELETE /api/admin/branches/:id ────────────────────────────────────────────
// Permanently deletes a branch and all its associated data (cascade delete in Prisma schema).
// This is irreversible — deleting a branch removes its staff, orders, tables, and menu items.
router.delete('/branches/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.branch.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
