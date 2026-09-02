const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const interests = [
    { name: 'Photography', displayOrder: 1 },
    { name: 'Traveling', displayOrder: 2 },
    { name: 'Reading', displayOrder: 3 },
    { name: 'Cooking', displayOrder: 4 },
    { name: 'Gaming', displayOrder: 5 },
    { name: 'Music', displayOrder: 6 },
    { name: 'Fitness', displayOrder: 7 },
  ];

  for (const i of interests) {
    await prisma.interest.upsert({
      where: { name: i.name },
      update: {},
      create: i
    });
  }
  console.log('Interests seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
