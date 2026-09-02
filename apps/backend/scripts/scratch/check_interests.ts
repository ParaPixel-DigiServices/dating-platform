import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const categories = await prisma.interest.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  console.log("Distinct Categories:", categories);
}
main().catch(console.error).finally(() => prisma.$disconnect());
