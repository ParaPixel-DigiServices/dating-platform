import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.development') });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.user.deleteMany({
    where: { email: { startsWith: 'dummy_' } }
  });
  console.log(`Deleted ${result.count} dummy users.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
