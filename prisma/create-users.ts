// ─── Create Users & Branches Script ──────────────────────────────────────────
// This is the FIRST script to run when setting up the database from scratch.
// It creates the 7 branches and all staff user accounts.
// Run it with: npx ts-node prisma/create-users.ts
//
// After running this, run Seed.ts to add menus and tables.
//
// Accounts created:
//   waiter@streakz.co.uk        (WAITER)
//   chef@streakz.co.uk          (CHEF)
//   cashier@streakz.co.uk       (CASHIER)
//   bm@streakz.co.uk            (BRANCH_MANAGER)
//   hq.manager@streakz.co.uk    (HQ_MANAGER)
//   admin@streakz.co.uk         (ADMIN)
//
// Password for ALL accounts: Password123!

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Step 1: Create the 7 branches ────────────────────────────────────────────
  // Each branch has a name, city, and full address.
  // Uses findFirst + create (not upsert) to avoid duplicates on re-runs.
  const BRANCH_DATA = [
    { name: 'HQ London',  city: 'London',     address: '12 Royal Court, Mayfair, London W1K 4AB' },
    { name: 'Manchester', city: 'Manchester', address: '45 Northern Quarter, Manchester M1 2HB' },
    { name: 'Edinburgh',  city: 'Edinburgh',  address: '8 Royal Mile, Edinburgh EH1 1TB' },
    { name: 'Bristol',    city: 'Bristol',    address: '22 Harbourside, Bristol BS1 4RG' },
    { name: 'Birmingham', city: 'Birmingham', address: '67 Balti Triangle, Birmingham B12 9QA' },
    { name: 'Leeds',      city: 'Leeds',      address: '34 Victoria Quarter, Leeds LS1 6AZ' },
    { name: 'Liverpool',  city: 'Liverpool',  address: '91 Albert Dock, Liverpool L3 4BB' },
  ];

  for (const b of BRANCH_DATA) {
    // Only create the branch if it doesn't already exist (safe to re-run)
    const exists = await prisma.branch.findFirst({ where: { name: b.name } });
    if (!exists) await prisma.branch.create({ data: b });
  }
  console.log('🏢 Branches ready (7 branches)');
  console.log('');

  // ── Step 2: Create staff accounts ────────────────────────────────────────────
  // Hash the password once, then reuse for all accounts.
  // bcrypt.hash(password, 10) — 10 is the "cost factor", standard for web apps.
  const pw = await bcrypt.hash('Password123!', 10);

  // All accounts defined in one array for easy maintenance.
  // "as const" ensures TypeScript treats the role strings as literal types, not just strings.
  const accounts = [
    { name: 'Waiter',         email: 'waiter@streakz.co.uk',       role: 'WAITER'         },
    { name: 'Chef',           email: 'chef@streakz.co.uk',         role: 'CHEF'           },
    { name: 'Cashier',        email: 'cashier@streakz.co.uk',      role: 'CASHIER'        },
    { name: 'Branch Manager', email: 'bm@streakz.co.uk',           role: 'BRANCH_MANAGER' },
    { name: 'HQ Manager',     email: 'hq.manager@streakz.co.uk',   role: 'HQ_MANAGER'     },
    { name: 'System Admin',   email: 'admin@streakz.co.uk',        role: 'ADMIN'          },
  ] as const;

  for (const acc of accounts) {
    // upsert: if the account already exists → update the password (in case it changed)
    //         if the account doesn't exist  → create it fresh
    // This makes the script safe to run multiple times.
    await prisma.user.upsert({
      where:  { email: acc.email },
      update: { password: pw },   // Re-hash password on re-run (keeps it fresh)
      create: { name: acc.name, email: acc.email, password: pw, role: acc.role },
    });
    console.log(`✅ ${acc.email}`);
  }
  console.log('');

  // ── Step 3: Create tables for each branch ────────────────────────────────────
  // Table 0 = virtual slot for online orders (0 seats, used when tableNumber is null)
  // Tables 1–4 = 2-seater tables
  // Tables 5–10 = 4-seater tables
  // Tables 11–15 = 6-seater tables (large groups)
  // skipDuplicates: true means re-running won't create duplicates
  const branches = await prisma.branch.findMany();
  if (branches.length === 0) {
    console.log('⚠️  No branches found — skipping table creation.');
  } else {
    for (const branch of branches) {
      await prisma.table.createMany({
        skipDuplicates: true, // Don't error if table already exists
        data: [
          { number: 0, seats: 0, branchId: branch.id }, // Virtual online-order slot
          ...Array.from({ length: 15 }, (_, i) => ({
            number: i + 1,
            seats: i < 5 ? 2 : i < 11 ? 4 : 6,        // Capacity by table index
            branchId: branch.id,
          })),
        ],
      });
      console.log(`🪑 Tables created for: ${branch.name}`);
    }
  }

  console.log('\n🎉 Done! Staff accounts + tables ready.');
  console.log('Password for all accounts: Password123!');
}

// ── Run the script ─────────────────────────────────────────────────────────────
main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect()); // Always close the DB connection when done
