import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, JwtPayload } from '../types';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;

  if (!authHeader?.startsWith('Bearer ') && !queryToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = queryToken ?? authHeader!.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };

export const ownBranchOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const branchId = parseInt(
    (req.params.branchId ?? req.query.branchId) as string
  );
  if (branchId && req.user.branchId !== branchId) {
    res.status(403).json({ message: 'Forbidden: not your branch' });
    return;
  }
  next();
};