import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.development' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: { wallet: true }
  });
  
  let updated = 0;
  for (const user of users) {
    if (!user.wallet) {
      const newWallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 100,
        }
      });
      
      await prisma.walletTransaction.create({
        data: {
          walletId: newWallet.id,
          amount: 100,
          type: 'EARN',
          description: 'Initial signup bonus (retroactive)'
        }
      });
      updated++;
    } else {
      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: { balance: { increment: 100 } }
      });
      
      await prisma.walletTransaction.create({
        data: {
          walletId: user.wallet.id,
          amount: 100,
          type: 'EARN',
          description: 'Bonus 100 coins gift'
        }
      });
      updated++;
    }
  }
  console.log(`Successfully added 100 coins to ${updated} users.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
