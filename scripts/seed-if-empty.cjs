const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function main() {
  const prisma = new PrismaClient();
  try {
    const flightCount = await prisma.flight.count();
    console.log(`[Seed Check] Current flight count: ${flightCount}`);
    if (flightCount === 0) {
      console.log('[Seed Check] Database is empty. Seeding initial flights and accounts...');
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    } else {
      console.log('[Seed Check] Database already has flights.');
    }
  } catch (err) {
    console.log('[Seed Check] Running initial seed:', err.message);
    try {
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    } catch (e) {
      console.error('[Seed Check] Seeding failed:', e.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
