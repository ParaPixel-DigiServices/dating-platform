import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const interests = await prisma.interest.findMany();
  console.log("Interests count:", interests.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
