const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const initialTopics = [
  { name: 'Advice', displayOrder: 1 },
  { name: 'Experiences', displayOrder: 2 },
  { name: 'Safety', displayOrder: 3 },
  { name: 'Relationships', displayOrder: 4 },
  { name: 'Questions', displayOrder: 5 }
];

async function main() {
  console.log('Seeding initial social topics...');
  
  for (const topic of initialTopics) {
    const created = await prisma.socialTopic.upsert({
      where: { name: topic.name },
      update: { displayOrder: topic.displayOrder },
      create: { 
        name: topic.name,
        displayOrder: topic.displayOrder,
        isActive: true
      }
    });
    console.log(`- Upserted topic: ${created.name}`);
  }
  
  console.log('Finished seeding social topics!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
