// ─── Authentication Routes ────────────────────────────────────────────────────
// Handles user login and logout.
// These routes are PUBLIC — no JWT token is required to access them.

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';   // Used to securely compare hashed passwords
import jwt from 'jsonwebtoken';  // Used to create JWT tokens on login
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient(); // Database client for querying users

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Logs a user in and returns a JWT token.
// Body: { email, password, branchId? }
// - email & password: the user's credentials
// - branchId (optional): required for branch-level staff (waiter, chef, etc.)
//   so they can specify which branch they are working at.
// Returns: { token, user: { id, name, role, branchId } }
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password, branchId } = req.body as { email: string; password: string; branchId?: number };

  try {
    // Step 1: Find the user by email in the database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Step 2: Compare the provided password with the hashed password in the DB
    // bcrypt.compare() returns true if they match
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    // Step 3: Determine the effective branch ID for the JWT
    // Priority: branchId from login body > branchId stored on user > null
    // ADMIN and HQ_MANAGER have no branchId, so this will be null for them
    const effectiveBranchId = branchId ?? user.branchId ?? null;

    // Step 4: Create a JWT token containing the user's id, role, and branchId
    // This token expires after 8 hours (a typical work shift)
    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: effectiveBranchId },
      process.env.JWT_SECRET as string, // Secret key from environment variables
      { expiresIn: '8h' }
    );

    // Step 5: Return the token and basic user info
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, branchId: effectiveBranchId },
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// Logs the user out. Since JWTs are stateless (stored on the client, not server),
// there is nothing to invalidate server-side. The frontend simply discards the token.
// This endpoint exists for completeness and future session tracking if needed.
router.post('/logout', (_req: Request, res: Response): void => {
  res.json({ message: 'Logged out' });
});

export default router;
