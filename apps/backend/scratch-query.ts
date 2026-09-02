import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: {
        profile: {
          include: {
            loveProfile: true,
            marriageProfile: true,
          },
        },
    }
  });

  console.dir(users, { depth: null });
}
main();
