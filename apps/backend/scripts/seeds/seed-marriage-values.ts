import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.development' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const christianValues = [
  "Daily Prayer", "Church Attendance", "Bible Reading & Study", "Holy Communion (Regular)", 
  "Prioritizing Spiritual Conversations in Marriage", "Faith in Jesus Christ", 
  "Spiritual Growth & Discipleship", "Worship & Praise", "Trust in God's Plan", 
  "God's Word as Life Guide", "Love Your Neighbor / Christian Compassion", 
  "Tithing & Generosity", "Missions & Outreach", "Sabbath / Rest Day (Sunday)", 
  "Christian Holidays", "Christian Marriage Values", "Raising Children in Faith", 
  "Christian Education for Children", "Teaching Children Prayer", "Purity & Moral Living", 
  "Accountability & Spiritual Fellowship", "Discussing Faith & Praying Together", 
  "Serving Each Other with Humility", "Personal Devotion & Quiet Time with God", 
  "Understanding the Life of Jesus", "Inviting Christ into Every Decision", 
  "Stewardship of Time, Money & Talents", "Walking in Faith During Trials", 
  "Witnessing & Sharing the Gospel", "Building a Christ-Centered Home"
];

const muslimValues = [
  "Five Daily Prayers", "Praying at the Mosque", "Qur'an Reading", "Ramadan Fasting", 
  "Ramadan at Home", "Eid Celebrations", "Hajj / Umrah", "Zakat", "Sadaqah / Charity", 
  "Dhikr / Daily Duas", "Halal Food Only", "Avoiding Interest / Riba", 
  "Islamic Banking Preference", "Modest Dressing", "Hijab Preference", "Keeping a Beard", 
  "No Alcohol at Home", "Islamic Environment at Home", "Qur'an Learning for Children", 
  "Islamic Schooling for Children", "Teaching Children Salah", "Teaching Children Arabic", 
  "Madrasa / Islamic Classes", "Celebrating Islamic Occasions", "Fasting Sunnah Days", 
  "Tahajjud / Night Prayer", "Attending Islamic Lectures", "Following a Madhhab", 
  "Islamic Rules in Marriage", "Islamic Inheritance / Property Rules"
];

const hinduValues = [
  "Daily Prayer / Puja", "Temple Visits", "Festivals & Celebrations", "Family Traditions", 
  "Respect for Elders", "Blessings from Elders", "Spirituality", "Meditation", "Yoga", 
  "Bhagavad Gita", "Bhajans / Devotional Music", "Mantras / Chanting", "Vegetarian Lifestyle", 
  "Fasting on Special Days", "Pilgrimages / Holy Places", "Seva / Charity", "Belief in Karma", 
  "Dharma & Good Values", "Prayer Space at Home", "Traditional Hindu Wedding", 
  "Horoscope / Kundli Matching", "Astrology", "Vastu Matters", "Auspicious Days & Muhurtham", 
  "Celebrating Regional Festivals", "Visiting Family During Festivals", "Teaching Children Hindu Values", 
  "Hindu Stories & Epics", "Traditional Food & Customs", "Modern Life with Hindu Traditions"
];

async function main() {
  console.log("Seeding Marriage Religious Values into Interests...");

  const allValues = [
    ...christianValues.map((name, i) => ({ name, category: 'CHRISTIAN_VALUES', displayOrder: i + 1 })),
    ...muslimValues.map((name, i) => ({ name, category: 'MUSLIM_VALUES', displayOrder: i + 1 })),
    ...hinduValues.map((name, i) => ({ name, category: 'HINDU_VALUES', displayOrder: i + 1 }))
  ];

  for (const item of allValues) {
    await prisma.interest.upsert({
      where: { name: item.name },
      update: { category: item.category, displayOrder: item.displayOrder },
      create: { 
        name: item.name, 
        category: item.category, 
        displayOrder: item.displayOrder 
      }
    });
  }

  console.log(`Successfully seeded ${allValues.length} Marriage Religious Values!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
