const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function main() {
  const prisma = new PrismaClient();
  try {
    const flightCount = await prisma.flight.count();
    const returnFlight = await prisma.flight.findUnique({ where: { flightNumber: 'SK-DXB-HGA' } });
    console.log(`[Seed Check] Current flight count: ${flightCount}, Return Flight SK-DXB-HGA exists: ${!!returnFlight}`);
    if (flightCount < 65 || !returnFlight) {
      console.log('[Seed Check] Database requires bidirectional & multi-class catalog update. Seeding flights and orders...');
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    } else {
      console.log('[Seed Check] Database already has full bidirectional catalog.');
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
