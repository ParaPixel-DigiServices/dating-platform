import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.development' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const commonInterests = {
  SPORTS_AND_FITNESS: [
    "Gym & Workout", "Yoga", "Running", "Swimming", "Cycling", 
    "Cricket", "Football", "Tennis", "Hiking", "Martial Arts"
  ],
  MUSIC: [
    "Pop", "Rock", "Classical", "Hip Hop & Rap", "Jazz & Blues", 
    "EDM", "Indie Music", "Bollywood", "R&B", "Acoustic"
  ],
  FOOD_AND_DRINK: [
    "Foodie", "Coffee Enthusiast", "Vegan", "Baking", "Street Food", 
    "Fine Dining", "Wine Tasting", "Craft Beer", "Cooking", "Tea Lover"
  ],
  HOBBIES_AND_ARTS: [
    "Photography", "Painting & Art", "Reading", "Writing", "Gardening", 
    "DIY & Crafts", "Theater & Plays", "Board Games", "Pottery", "Dancing"
  ],
  LIFESTYLE: [
    "Travel & Adventure", "Fashion", "Technology", "Pets & Animals", 
    "Astrology", "Volunteer Work", "Entrepreneurship", "Minimalism", 
    "Nature Lover", "Concerts & Events"
  ]
};

async function main() {
  console.log("Seeding Common Interests...");

  for (const [category, interests] of Object.entries(commonInterests)) {
    for (let i = 0; i < interests.length; i++) {
      await prisma.interest.upsert({
        where: { name: interests[i] },
        update: { category, displayOrder: i + 1 },
        create: { 
          name: interests[i], 
          category, 
          displayOrder: i + 1 
        }
      });
    }
  }

  const total = Object.values(commonInterests).reduce((acc, curr) => acc + curr.length, 0);
  console.log(`Successfully seeded ${total} Common Interests across ${Object.keys(commonInterests).length} categories!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
