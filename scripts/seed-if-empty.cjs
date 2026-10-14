const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function main() {
  const prisma = new PrismaClient();
  try {
    const flightCount = await prisma.flight.count();
    const flagship2027 = await prisma.flight.findUnique({ where: { flightNumber: 'D4-2027' } });
    console.log(`[Seed Check] Current flight count: ${flightCount}, Flagship 2027 exists: ${!!flagship2027}`);
    if (flightCount < 50 || !flagship2027) {
      console.log('[Seed Check] Database requires full timeline catalog update (Sep 2026 - Dec 2027). Seeding flights and orders...');
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    } else {
      console.log('[Seed Check] Database already has full timeline flights.');
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
