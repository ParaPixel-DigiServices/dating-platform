import { PrismaClient, QuestionCategory } from '@prisma/client';
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
    "Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Jewish", "Spiritual", "Atheist", "Others"
  ];

  for (let i = 0; i < religions.length; i++) {
    await prisma.religion.upsert({
      where: { name: religions[i] },
      update: { displayOrder: i + 1, isActive: true },
      create: { name: religions[i], displayOrder: i + 1, isActive: true }
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

  // ── Interests & Marriage Values ─────────────────────────────────────────────
  const basicInterests = [
    'Travel', 'Music', 'Fitness', 'Cooking', 'Photography',
    'Art', 'Books', 'Gaming', 'Movies', 'Sports',
    'Yoga', 'Hiking', 'Dancing', 'Foodie', 'Tech',
  ];

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

  const allInterests = [
    ...basicInterests.map((name, i) => ({ name, category: 'GENERAL', displayOrder: i + 1 })),
    ...christianValues.map((name, i) => ({ name, category: 'CHRISTIAN_VALUES', displayOrder: i + 1 })),
    ...muslimValues.map((name, i) => ({ name, category: 'MUSLIM_VALUES', displayOrder: i + 1 })),
    ...hinduValues.map((name, i) => ({ name, category: 'HINDU_VALUES', displayOrder: i + 1 }))
  ];

  for (const item of allInterests) {
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
  console.log(`  ✅ ${allInterests.length} interests and marriage values seeded`);

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

  // ── Questions (Synch and Insight) ────────────────────────────────────────
  const syncQuestions = [
    "Couples should talk to each other every day.",
    "It is okay to need personal space even when you're in love.",
    "Partners should tell each other when something is bothering them.",
    "Small arguments should be solved before going to sleep.",
    "It's important to say \"I love you\" often in a relationship.",
    "Couples should spend most of their free time together.",
    "Both partners should have their own friends and social life.",
    "Major financial decisions should always be made together.",
    "Both partners should contribute to household responsibilities.",
    "Career decisions should consider how they affect the relationship.",
    "Spending time with each other's families is important.",
    "A partner should be comfortable sharing their phone password.",
    "A little jealousy is normal when you really love someone.",
    "Partners should tell each other where they're going when they go out.",
    "Saying sorry first is more important than proving who was right.",
    "Physical affection is important for keeping a relationship close.",
    "Romance should continue even after years of being together.",
    "Couples should regularly go on dates even after marriage.",
    "Having children is an important part of the future I imagine with a partner.",
    "Partners should discuss problems between themselves before involving family or friends.",
    "It's okay for partners to have different hobbies and interests.",
    "I would be comfortable if my partner earns more than me.",
    "Partners should tell each other almost everything.",
    "Celebrating birthdays, anniversaries and special days matters in a relationship.",
    "Love alone isn't enough; lifestyle compatibility matters too.",
    "When one partner is struggling, the other should temporarily take on more responsibility.",
    "Couples should be able to disagree without it becoming a fight.",
    "Having some privacy is healthy even in a serious relationship.",
    "I prefer a peaceful and stable relationship over an exciting but unpredictable one.",
    "My partner should also feel like my best friend."
  ];

  const syncOptions = ["Agree", "No opinion", "Disagree"];

  const insightQuestions = [
    {
      text: "You had a bad fight at night. She texts: \"I don't want to sleep like this.\" What do you do?",
      options: [
        "Call her immediately and sort it out",
        "Text calmly until we both feel better",
        "Say sorry for my part and talk tomorrow",
        "I need time before talking",
        "If I'm still angry, I'm sleeping"
      ]
    },
    {
      text: "You're with your friends and she calls saying she's stranded somewhere and needs help.",
      options: [
        "Leave immediately and go get her",
        "Arrange something safe and stay on the phone",
        "Ask if someone closer can help first",
        "Book her a cab and continue my evening",
        "Depends how far away she is"
      ]
    },
    {
      text: "She's having a terrible day and suddenly gets irritated with you for something small.",
      options: [
        "Understand that she's having a bad day",
        "Ask what's actually bothering her",
        "Give her space and talk later",
        "Tell her not to take it out on me",
        "Now we're BOTH having a bad day"
      ]
    },
    {
      text: "She gets a huge opportunity that means she'll be extremely busy for the next six months.",
      options: [
        "Support her completely",
        "Ask how we can make the relationship work around it",
        "Support her, but expect her to make time for us too",
        "I'd worry we'd become distant",
        "I wouldn't want the relationship coming second"
      ]
    },
    {
      text: "She makes a mistake that costs both of you a decent amount of money.",
      options: [
        "Fix the problem first; discuss it later",
        "I'd be upset but wouldn't attack her",
        "Ask how it happened and solve it together",
        "I'd definitely get angry initially",
        "She's hearing about this for the next ten years"
      ]
    },
    {
      text: "When something is bothering you, you're usually someone who...",
      options: [
        "Talks about it openly",
        "Talks only to people I'm very close to",
        "Thinks about it alone first, then talks",
        "Keeps most things to myself",
        "Makes jokes until everyone forgets I'm suffering"
      ]
    },
    {
      text: "When you realise you've genuinely hurt someone, what comes most naturally?",
      options: [
        "Apologising immediately",
        "Understanding exactly what hurt them",
        "Trying to make it right through actions",
        "Needing some time before I admit it",
        "Apologies aren't exactly my superpower"
      ]
    },
    {
      text: "Which describes you best when life doesn't go according to plan?",
      options: [
        "I adapt quickly",
        "I stay calm and find another solution",
        "I get stressed but recover quickly",
        "I need time to accept changes",
        "I complain dramatically and then eventually fix it"
      ]
    },
    {
      text: "How are you with affection?",
      options: [
        "Very expressive - words, hugs, everything",
        "More actions than words",
        "Affectionate only when I'm really comfortable",
        "I'm naturally reserved",
        "I will roast you lovingly instead"
      ]
    },
    {
      text: "Which matters MOST to you in becoming a better man?",
      options: [
        "Being kind",
        "Being dependable",
        "Being successful",
        "Being emotionally strong",
        "Being someone my family and partner can be proud of"
      ]
    },
    {
      text: "When you're having a difficult time, what do you MOST want from your partner?",
      options: [
        "Listen to me without judging",
        "Comfort and affection",
        "Help me find a solution",
        "Give me some space",
        "Just stay beside me - she doesn't need to fix anything"
      ]
    },
    {
      text: "How much independence would you like your partner to have?",
      options: [
        "Completely independent - her life, career and friends matter",
        "Independent, but we keep each other involved",
        "We should make most important decisions together",
        "I prefer us doing most things as a couple",
        "I like a very traditional relationship"
      ]
    },
    {
      text: "If you and your partner disagree strongly, what do you expect from her?",
      options: [
        "Tell me exactly what she thinks",
        "Hear me out and I'll hear her out",
        "Both of us should compromise",
        "Give us time to cool down first",
        "Sometimes one person just has to let it go"
      ]
    },
    {
      text: "What kind of attention do you naturally expect in a relationship?",
      options: [
        "Lots of communication throughout the day",
        "A few meaningful conversations are enough",
        "Regular calls/messages but nothing excessive",
        "I'm fine even if we're both busy all day",
        "Send memes and remind me I'm still loved"
      ]
    },
    {
      text: "Deep down, what do you MOST want your partner to be for you?",
      options: [
        "My best friend",
        "My emotional safe place",
        "My equal teammate",
        "My biggest supporter",
        "My peaceful home after dealing with the whole world"
      ]
    }
  ];

  await prisma.question.deleteMany(); 
  
  let order = 1;
  for (const text of syncQuestions) {
    await prisma.question.create({
      data: {
        category: QuestionCategory.SYNCHRONIZATION,
        text,
        options: syncOptions,
        displayOrder: order++
      }
    });
  }

  order = 1;
  for (const q of insightQuestions) {
    await prisma.question.create({
      data: {
        category: QuestionCategory.INSIGHT,
        text: q.text,
        options: q.options,
        displayOrder: order++
      }
    });
  }

  console.log(`  ✅ ${syncQuestions.length + insightQuestions.length} questions seeded`);

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
