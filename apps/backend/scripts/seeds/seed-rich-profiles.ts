import { PrismaClient, CategoryType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.development') });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const occupations = ['Designer', 'Software Engineer', 'Photographer', 'Doctor', 'Product Manager', 'Architect', 'Lawyer', 'Literature Professor', 'Data Scientist', 'Musician'];
const educations = ['B.Tech, NIT', 'MBA, IIM', 'MBBS, AIIMS', 'B.A., Delhi University', 'M.S., Stanford'];
const religions = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Agnostic', 'Atheist', 'Buddhist'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad'];

const namesMale = ['Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Kabir', 'Aryan', 'Dhruv', 'Ishaan', 'Dev', 'Arjun', 'Rahul', 'Karan', 'Vikram'];
const namesFemale = ['Priya', 'Ananya', 'Meera', 'Kavya', 'Shreya', 'Neha', 'Riya', 'Aisha', 'Simran', 'Tara', 'Roshni', 'Sana', 'Kriti'];

const interests = ['Hiking', 'Gaming', 'Coffee', 'Meditation', 'Photography', 'Music', 'Cooking', 'Art', 'Dance', 'Fitness', 'Travel', 'Books', 'Movies', 'Yoga'];

const heights = [150, 155, 160, 165, 170, 175, 180, 185]; // in cm

function getRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInterests(count: number) {
  const shuffled = [...interests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function createRichProfile(gender: 'Male' | 'Female', category: CategoryType, index: number) {
  const name = gender === 'Male' ? getRandom(namesMale) : getRandom(namesFemale);
  const email = `dummy_${category.toLowerCase()}_${gender.toLowerCase()}_${index}_${uuidv4().substring(0, 5)}@test.com`;

  const user = await prisma.user.create({
    data: {
      email,
      firebaseUid: uuidv4(),
      phoneNumber: `+919999${Math.floor(100000 + Math.random() * 900000)}`,
      wallet: {
        create: { balance: 150 }
      }
    }
  });

  // Calculate a reasonable DOB (age 20-35)
  const age = 20 + Math.floor(Math.random() * 15);
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - age);

  // Fetch or create religion
  const relName = getRandom(religions);
  let relRecord = await prisma.religion.findFirst({ where: { name: relName } });
  if (!relRecord) {
    relRecord = await prisma.religion.create({ data: { name: relName } });
  }

  // Ensure interests exist
  const selectedInterests = getRandomInterests(4);
  const interestRecords: any[] = [];
  for (const iName of selectedInterests) {
    let rec = await prisma.interest.findFirst({ where: { name: iName } });
    if (!rec) {
      rec = await prisma.interest.create({ data: { name: iName, category: 'General' } });
    }
    interestRecords.push(rec);
  }

  const bio = `Hi, I'm ${name}! I work as a ${getRandom(occupations)}. I love exploring new places and finding good coffee spots. Looking for someone who enjoys ${selectedInterests[0].toLowerCase()} as much as I do. Let's talk about ${selectedInterests[1].toLowerCase()} and see where it goes!`;

  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      category,
      firstName: name,
      lastName: category === CategoryType.MARRIAGE ? 'Sharma' : '',
      gender: gender === 'Male' ? 'MALE' : 'FEMALE',
      dateOfBirth: dob,
      city: getRandom(cities),
      country: 'India',
      bio,
      heightCm: getRandom(heights),
      educationLevel: getRandom(['BACHELORS', 'MASTERS', 'PHD']),
      occupation: getRandom(occupations),
      drinkingHabit: getRandom(['OCCASIONALLY', 'NEVER', 'REGULARLY']),
      smokingHabit: getRandom(['OCCASIONALLY', 'NEVER', 'REGULARLY']),
      religionId: relRecord.id,
      isCompleted: true,
      completionPercentage: 100,
      onboardingStatus: true,
      annualIncome: getRandom(['3_TO_5L', '5_TO_10L', '10_TO_15L', '15_TO_20L', '20L_PLUS']),
      maritalStatus: getRandom(['NEVER_MARRIED', 'DIVORCED', 'WIDOWED']),
      interests: {
        create: interestRecords.map((ir, i) => ({
          interestId: ir?.id,
        }))
      }
    }
  });

  if (category === CategoryType.LOVE) {
    await prisma.loveProfile.create({
      data: {
        profileId: profile.id
      }
    });
  } else {
    await prisma.marriageProfile.create({
      data: {
        profileId: profile.id,
        familyType: getRandom(['NUCLEAR', 'JOINT']),
        familyLivingStatus: getRandom(['WITH_FAMILY', 'LIVING_ALONE']),
        familyIncome: getRandom(['MIDDLE', 'HIGH', 'ELITE']),
        fatherName: 'Mr. ' + getRandom(namesMale),
        motherName: 'Mrs. ' + getRandom(namesFemale),
        brotherCount: Math.floor(Math.random() * 3),
        sisterCount: Math.floor(Math.random() * 3),
        relocationPreference: getRandom(['DOMESTIC', 'ABROAD', 'BOTH', 'NOT_WILLING'])
      }
    });
  }

  const oppositeGender = gender === 'Male' ? 'FEMALE' : 'MALE';
  await prisma.partnerPreference.create({
    data: {
      profileId: profile.id,
      genderPreference: [oppositeGender],
      minHeightCm: profile.heightCm ? profile.heightCm - 30 : 140,
      maxHeightCm: profile.heightCm ? profile.heightCm + 30 : 200,
    }
  });

  console.log(`Created ${category} profile for ${name} (${gender}, Age ${age})`);
}

async function main() {
  console.log('Seeding rich dummy profiles...');
  
  // 5 Love Male, 5 Love Female
  for (let i = 0; i < 5; i++) {
    await createRichProfile('Male', CategoryType.LOVE, i);
    await createRichProfile('Female', CategoryType.LOVE, i);
  }

  // 5 Marriage Male, 5 Marriage Female
  for (let i = 0; i < 5; i++) {
    await createRichProfile('Male', CategoryType.MARRIAGE, i);
    await createRichProfile('Female', CategoryType.MARRIAGE, i);
  }
  
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
