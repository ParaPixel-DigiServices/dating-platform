import { PrismaClient, CategoryType, Gender } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.development' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const loveNames = ["Aarav", "Priya", "Rahul", "Sneha", "Karan"];
const marriageNames = ["Vikram", "Neha", "Aditya", "Riya", "Rohan"];

async function main() {
  console.log('🌱 Seeding fake users...');

  // Create 5 LOVE users
  for (let i = 0; i < 5; i++) {
    const isMale = i % 2 === 0;
    const gender = isMale ? Gender.MALE : Gender.FEMALE;
    const name = loveNames[i];
    
    await prisma.user.create({
      data: {
        firebaseUid: uuidv4(),
        email: `love_user_${i}@example.com`,
        profile: {
          create: {
            firstName: name,
            lastName: "Sharma",
            dateOfBirth: new Date("1998-05-15"),
            gender: gender,
            category: CategoryType.LOVE,
            bio: `Hi, I'm ${name}! Just looking for a real connection.`,
            loveProfile: {
              create: {}
            },
            photos: {
              create: [
                {
                  storageKey: `photo_${i}`,
                  cdnUrl: `https://ui-avatars.com/api/?name=${name}&background=random`,
                  displayOrder: 1,
                  isPrimary: true
                }
              ]
            }
          }
        }
      }
    });
  }

  // Create 5 MARRIAGE users
  for (let i = 0; i < 5; i++) {
    const isMale = i % 2 === 0;
    const gender = isMale ? Gender.MALE : Gender.FEMALE;
    const name = marriageNames[i];

    await prisma.user.create({
      data: {
        firebaseUid: uuidv4(),
        email: `marriage_user_${i}@example.com`,
        profile: {
          create: {
            firstName: name,
            lastName: "Verma",
            dateOfBirth: new Date("1995-10-20"),
            gender: gender,
            category: CategoryType.MARRIAGE,
            bio: `Hello, I am ${name}. Looking to settle down with someone compatible.`,
            marriageProfile: {
              create: {}
            },
            photos: {
              create: [
                {
                  storageKey: `photo_m_${i}`,
                  cdnUrl: `https://ui-avatars.com/api/?name=${name}&background=random`,
                  displayOrder: 1,
                  isPrimary: true
                }
              ]
            }
          }
        }
      }
    });
  }

  console.log(`  ✅ 10 fake users seeded`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
