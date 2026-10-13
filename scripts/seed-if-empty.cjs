const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function main() {
  const prisma = new PrismaClient();
  try {
    const flightCount = await prisma.flight.count();
    const dFlight = await prisma.flight.findUnique({ where: { flightNumber: 'D4721' } });
    console.log(`[Seed Check] Current flight count: ${flightCount}, SkyTickets D4721 exists: ${!!dFlight}`);
    if (flightCount === 0 || !dFlight) {
      console.log('[Seed Check] Database requires SkyTickets catalog update. Seeding flights and accounts...');
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    } else {
      console.log('[Seed Check] Database already has SkyTickets flights.');
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
