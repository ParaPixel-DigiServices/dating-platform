import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.development' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const religions = [
  "Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Jewish", "Spiritual", "Atheist", "Other"
];

async function main() {
  console.log("Seeding Religions...");
  for (let i = 0; i < religions.length; i++) {
    await prisma.religion.upsert({
      where: { name: religions[i] },
      update: { displayOrder: i + 1, isActive: true },
      create: { name: religions[i], displayOrder: i + 1, isActive: true }
    });
  }
  console.log(`Successfully seeded ${religions.length} religions!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
