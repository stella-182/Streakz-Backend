import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, authorize('ADMIN'));

// GET /api/admin/users
router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, branchId: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/admin/users
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, branchId } = req.body as {
    name: string; email: string; password: string; role: Role; branchId?: number;
  };
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, branchId: branchId ?? null },
    });
    res.status(201).json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  const { role, branchId } = req.body as { role: Role; branchId?: number };
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { role, branchId: branchId ?? null },
    });
    res.json({ id: user.id, role: user.role, branchId: user.branchId });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET /api/admin/branches
router.get('/branches', async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/admin/branches
router.post('/branches', async (req: Request, res: Response): Promise<void> => {
  const { name, city, address } = req.body as { name: string; city: string; address: string };
  try {
    const branch = await prisma.branch.create({ data: { name, city, address } });
    res.status(201).json(branch);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PUT /api/admin/branches/:id
router.put('/branches/:id', async (req: Request, res: Response): Promise<void> => {
  const { name, city, address } = req.body as { name: string; city: string; address: string };
  try {
    const branch = await prisma.branch.update({
      where: { id: parseInt(req.params.id) },
      data: { name, city, address },
    });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// DELETE /api/admin/branches/:id
router.delete('/branches/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.branch.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;