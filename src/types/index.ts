export type Role =
  | 'ADMIN'
  | 'HQ_MANAGER'
  | 'BRANCH_MANAGER'
  | 'CHEF'
  | 'CASHIER'
  | 'WAITER';

export type OrderStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'PAID';

export interface JwtPayload {
  id: number;
  role: Role;
  branchId: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}