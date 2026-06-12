// ─── Shared TypeScript Types ──────────────────────────────────────────────────
// This file defines types and interfaces used across the entire backend.
// Centralising them here means we only define them once and import as needed.

// ── Role ──────────────────────────────────────────────────────────────────────
// All possible staff roles in the system.
// These match exactly the Role enum defined in prisma/schema.prisma.
export type Role =
  | 'ADMIN'           // Full system access — manages users and branches
  | 'HQ_MANAGER'      // Headquarters manager — views all branch performance
  | 'BRANCH_MANAGER'  // Manages a single branch — views sales, staff, orders
  | 'CHEF'            // Kitchen staff — views and updates order status, manages menu
  | 'CASHIER'         // Processes payments — generates receipts
  | 'WAITER';         // Front-of-house — takes and delivers orders

// ── OrderStatus ───────────────────────────────────────────────────────────────
// The lifecycle stages of an order, from placement to payment.
// These match exactly the OrderStatus enum in prisma/schema.prisma.
export type OrderStatus =
  | 'PENDING'    // Order has just been placed — awaiting kitchen
  | 'PREPARING'  // Chef has started preparing the order
  | 'READY'      // Order is ready to be served
  | 'DELIVERED'  // Waiter has delivered the order to the table
  | 'PAID';      // Cashier has generated a receipt and payment is complete

// ── JwtPayload ────────────────────────────────────────────────────────────────
// The data stored inside the JWT token when a user logs in.
// This is decoded by the authenticate middleware and attached to req.user.
export interface JwtPayload {
  id: number;             // The user's database ID
  role: Role;             // The user's role (used for route authorisation)
  branchId: number | null; // The branch they logged into (null for ADMIN/HQ_MANAGER)
}

// ── Express Request Extension ─────────────────────────────────────────────────
// This tells TypeScript that every Express Request object has a `user` property.
// Without this, TypeScript would complain when we write req.user in route handlers.
// The user property is set by the authenticate middleware after verifying the JWT.
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload; // Decoded JWT payload attached after authentication
    }
  }
}
