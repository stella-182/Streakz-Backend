import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── 0. Branches ────────────────────────────────────────────────────────────
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
    const exists = await prisma.branch.findFirst({ where: { name: b.name } });
    if (!exists) await prisma.branch.create({ data: b });
  }
  console.log('🏢 Branches ready (7 branches)');
  console.log('');

  // ── 1. Staff accounts ──────────────────────────────────────────────────────
  const pw = await bcrypt.hash('Password123!', 10);

  const accounts = [
    { name: 'Waiter',         email: 'waiter@streakz.co.uk',       role: 'WAITER'         },
    { name: 'Chef',           email: 'chef@streakz.co.uk',         role: 'CHEF'           },
    { name: 'Cashier',        email: 'cashier@streakz.co.uk',      role: 'CASHIER'        },
    { name: 'Branch Manager', email: 'bm@streakz.co.uk',           role: 'BRANCH_MANAGER' },
    { name: 'HQ Manager',     email: 'hq.manager@streakz.co.uk',   role: 'HQ_MANAGER'     },
    { name: 'System Admin',   email: 'admin@streakz.co.uk',        role: 'ADMIN'          },
  ] as const;

  for (const acc of accounts) {
    await prisma.user.upsert({
      where:  { email: acc.email },
      update: { password: pw },
      create: { name: acc.name, email: acc.email, password: pw, role: acc.role },
    });
    console.log(`✅ ${acc.email}`);
  }
  console.log('');

  // ── 2. Tables (0–15 per branch) ────────────────────────────────────────────
  // table 0  = virtual slot for online orders
  // tables 1–15 = dine-in tables
  const branches = await prisma.branch.findMany();
  if (branches.length === 0) {
    console.log('⚠️  No branches found — skipping table creation.');
  } else {
    for (const branch of branches) {
      await prisma.table.createMany({
        skipDuplicates: true,
        data: [
          { number: 0, seats: 0, branchId: branch.id },
          ...Array.from({ length: 15 }, (_, i) => ({
            number: i + 1,
            seats: i < 5 ? 2 : i < 11 ? 4 : 6,
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

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
