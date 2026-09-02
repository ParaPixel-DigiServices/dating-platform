import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const loveProfiles = await prisma.loveProfile.findMany();
  
  for (const lp of loveProfiles) {
    let sparkProfile = await prisma.sparkProfile.findUnique({
      where: { loveProfileId: lp.id }
    });
    
    if (!sparkProfile) {
      sparkProfile = await prisma.sparkProfile.create({
        data: { loveProfileId: lp.id, maxQuestions: 3 }
      });
    }

    const latest = await prisma.sparkProfileVersion.findFirst({
      where: { sparkProfileId: sparkProfile.id }
    });

    if (!latest) {
      const version = await prisma.sparkProfileVersion.create({
        data: {
          sparkProfileId: sparkProfile.id,
          versionNumber: 1,
          questions: {
            create: [
              { text: `What's your favorite memory related to dating?`, displayOrder: 0, isRequired: true },
              { text: "If we went on a road trip, where would we go?", displayOrder: 1, isRequired: true },
              { text: "Pineapple on pizza: yes or no?", displayOrder: 2, isRequired: true }
            ]
          }
        }
      });

      await prisma.sparkProfile.update({
        where: { id: sparkProfile.id },
        data: { activeVersionId: version.id }
      });
    }
  }
  console.log("Seeded spark profiles!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
