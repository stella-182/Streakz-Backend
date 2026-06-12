// ─── Authentication & Authorisation Middleware ───────────────────────────────
// These middleware functions protect routes by checking JWT tokens and roles.
// They are used in every staff route (waiter, chef, cashier, bm, hm, admin).

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, JwtPayload } from '../types';

// ── authenticate ─────────────────────────────────────────────────────────────
// Checks that a valid JWT token is present on the request.
// The token can come from:
//   1. The Authorization header: "Bearer <token>"  (used by all API calls)
//   2. A query parameter: ?token=<token>           (used by the PDF download)
// If the token is valid, the decoded user info (id, role, branchId) is attached
// to req.user so the next middleware/route can use it.
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;        // e.g. "Bearer eyJ..."
  const queryToken = req.query.token as string | undefined; // e.g. ?token=eyJ...

  // If neither source has a token, reject the request
  if (!authHeader?.startsWith('Bearer ') && !queryToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Prefer query token (for PDF), otherwise extract from Authorization header
  const token = queryToken ?? authHeader!.split(' ')[1];

  try {
    // Verify the token using the secret key stored in environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded; // Attach decoded user info to the request object
    next();             // Pass control to the next middleware or route handler
  } catch {
    // Token is expired, tampered with, or otherwise invalid
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ── authorize ─────────────────────────────────────────────────────────────────
// Checks that the logged-in user has one of the allowed roles.
// Used after authenticate — e.g. authorize('CHEF') only allows chefs through.
// Returns a middleware function that Express can use directly on a router.
export const authorize = (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    // Check if the user's role is in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient role' });
      return;
    }
    next(); // Role is allowed — proceed to the route handler
  };

// ── ownBranchOnly ─────────────────────────────────────────────────────────────
// Ensures a staff member can only access data for their own branch.
// Compares the branchId in the URL/query against the branchId in their JWT token.
// Useful for preventing a manager from one branch accessing another branch's data.
export const ownBranchOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Read branchId from URL params (:branchId) or query string (?branchId=)
  const branchId = parseInt(
    (req.params.branchId ?? req.query.branchId) as string
  );

  // If a branchId was provided and it doesn't match the user's branch, block access
  if (branchId && req.user.branchId !== branchId) {
    res.status(403).json({ message: 'Forbidden: not your branch' });
    return;
  }

  next(); // Branch matches (or no branchId was specified) — allow through
};
