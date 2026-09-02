import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.development' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding fake posts...');

  // Get a user to act as the author (we'll post anonymously)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ No users found in database. Cannot create posts.');
    return;
  }

  // Get all topics
  const topics = await prisma.socialTopic.findMany();
  if (topics.length === 0) {
    console.error('❌ No topics found in database.');
    return;
  }

  const fakePosts = [
    {
      title: "How do you politely decline a second date?",
      body: "I went on a date yesterday and he was nice, but there was absolutely zero spark. He just texted me asking to meet up again this weekend. What's the best way to let him down easy without ghosting?",
      topicName: "Advice"
    },
    {
      title: "Red flags or am I overthinking?",
      body: "We've been talking for two weeks and he's super sweet, but he refuses to share any details about his work or where he lives. He says he's just 'private'. Is this normal or a huge red flag?",
      topicName: "Safety"
    },
    {
      title: "Safety tips for first dates?",
      body: "Meeting someone from an app for the first time tomorrow. We're getting coffee in the afternoon. Any specific safety rituals you ladies swear by?",
      topicName: "Safety"
    },
    {
      title: "We just had our first anniversary!",
      body: "We met on this app exactly a year ago. Just wanted to share some positivity and say that it really is possible to find your person here. Don't give up hope!",
      topicName: "Experiences"
    },
    {
      title: "Is it weird to ask about exes?",
      body: "How soon is too soon to ask someone about their past relationships? I feel like it tells you a lot about a person, but I don't want to come across as nosey.",
      topicName: "Questions"
    }
  ];

  for (const post of fakePosts) {
    const topic = topics.find(t => t.name === post.topicName) || topics[Math.floor(Math.random() * topics.length)];
    
    await prisma.socialPost.create({
      data: {
        userId: user.id,
        topicId: topic.id,
        title: post.title,
        body: post.body,
        isAnonymous: true,
        voteCount: Math.floor(Math.random() * 50) + 5 // random initial votes
      },
    });
  }

  console.log(`  ✅ 5 fake posts seeded`);
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
