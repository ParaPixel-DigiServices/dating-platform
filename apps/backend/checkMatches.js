require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany();
  console.log("Total Matches:", matches.length);
  console.log(JSON.stringify(matches, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
