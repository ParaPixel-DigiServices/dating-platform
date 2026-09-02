const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { wallet: true }
  });
  
  let updated = 0;
  for (const user of users) {
    if (!user.wallet) {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 100,
        }
      });
      
      // Also log the transaction
      const wallet = await prisma.wallet.findUnique({ where: { userId: user.id }});
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: 100,
          type: 'EARN',
          description: 'Initial signup bonus (retroactive)'
        }
      });
      updated++;
    } else {
      // If wallet exists, add 100
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
