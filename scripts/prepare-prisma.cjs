const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || '';

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('[Prisma Config] Detected PostgreSQL database URL. Configuring provider for postgresql.');
  schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema, 'utf8');
} else {
  console.log('[Prisma Config] Using SQLite provider.');
}
