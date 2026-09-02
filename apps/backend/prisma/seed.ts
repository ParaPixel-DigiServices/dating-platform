import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.development' }); // Backend environment

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ── Religions ──────────────────────────────────────────────────────────────
  const religions = [
    'Hindu', 'Muslim', 'Christian', 'Sikh',
    'Buddhist', 'Jain', 'Others',
  ];

  for (const name of religions) {
    await prisma.religion.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✅ ${religions.length} religions seeded`);

  // ── Languages ─────────────────────────────────────────────────────────────
  const languages = [
    { name: 'English',    code: 'en' },
    { name: 'Hindi',      code: 'hi' },
    { name: 'Tamil',      code: 'ta' },
    { name: 'Telugu',     code: 'te' },
    { name: 'Kannada',    code: 'kn' },
    { name: 'Malayalam',  code: 'ml' },
    { name: 'Bengali',    code: 'bn' },
    { name: 'Marathi',    code: 'mr' },
    { name: 'Punjabi',    code: 'pa' },
    { name: 'Gujarati',   code: 'gu' },
    { name: 'Urdu',       code: 'ur' },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name },
      create: { name: lang.name, code: lang.code },
    });
  }
  console.log(`  ✅ ${languages.length} languages seeded`);

  // ── Interests ─────────────────────────────────────────────────────────────
  const interests = [
    'Travel', 'Music', 'Fitness', 'Cooking', 'Photography',
    'Art', 'Books', 'Gaming', 'Movies', 'Sports',
    'Yoga', 'Hiking', 'Dancing', 'Foodie', 'Tech',
  ];

  for (const name of interests) {
    await prisma.interest.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✅ ${interests.length} interests seeded`);

  // ── Social Topics ────────────────────────────────────────────────────────
  const socialTopics = [
    { name: 'Advice', displayOrder: 1 },
    { name: 'Experiences', displayOrder: 2 },
    { name: 'Safety', displayOrder: 3 },
    { name: 'Relationships', displayOrder: 4 },
    { name: 'Questions', displayOrder: 5 }
  ];

  for (const topic of socialTopics) {
    await prisma.socialTopic.upsert({
      where: { name: topic.name },
      update: { displayOrder: topic.displayOrder },
      create: { 
        name: topic.name,
        displayOrder: topic.displayOrder,
        isActive: true
      },
    });
  }
  console.log(`  ✅ ${socialTopics.length} social topics seeded`);

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
