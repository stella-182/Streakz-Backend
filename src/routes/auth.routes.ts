import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password, branchId } = req.body as { email: string; password: string; branchId?: number };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    // Branch-level roles must select a branch at login; use it in JWT
    const effectiveBranchId = branchId ?? user.branchId ?? null;

    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: effectiveBranchId },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, branchId: effectiveBranchId },
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.json({ message: 'Logged out' });
});

export default router;