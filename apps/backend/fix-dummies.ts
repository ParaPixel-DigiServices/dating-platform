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
  const result = await prisma.profile.updateMany({
    where: { user: { email: { startsWith: 'dummy_' } } },
    data: {
      completionPercentage: 100,
      onboardingStatus: true
    }
  });
  console.log(`Updated ${result.count} dummy profiles to 100% complete.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
