import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Prisma } from '@prisma/client';
import * as prismaClient from '@prisma/client';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class UserService {
  constructor(private prisma: DatabaseService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            photos: true,
            interests: { include: { interest: true } },
            languages: { include: { language: true } },
            religion: true,
            caste: true,
            loveProfile: true,
            marriageProfile: true,
            userAnswers: { include: { question: true } },
            partnerPreference: true,
          },
        },
        wallet: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.profile) {
      // Always recalculate the live score so the UI reflects actual field state.
      // (isCompleted=true from onboarding was freezing the score at 100% even when fields were empty)
      const pct = this.calculateCompletionScore(user.profile);
      user.profile.completionPercentage = pct;
      user.profile.isCompleted = pct === 100;

      // Fire-and-forget: keep DB in sync
      this.prisma.profile.update({
        where: { id: user.profile.id },
        data: { completionPercentage: pct, isCompleted: pct === 100 },
      }).catch((e) => Logger.error(e, UserService.name));
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // 1. Fetch user to know their category
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const { category } = user.profile;
    const profileId = user.profile.id;

    // 2. Separate DTO fields
    const {
      interestIds,
      marriageSubCategory,
      familyLivingStatus,
      familyIncome,
      fatherName,
      motherName,
      brotherCount,
      sisterCount,
      relocationPreference,
      ...baseProfileData
    } = dto;

    // 3. Update Base Profile
    await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        ...baseProfileData,
      },
    });

    if (interestIds !== undefined) {
      await this.prisma.userInterest.deleteMany({
        where: { profileId }
      });
      if (interestIds.length > 0) {
        await this.prisma.userInterest.createMany({
          data: interestIds.map(id => ({
            profileId,
            interestId: id
          }))
        });
      }
    }

    // 4. Route specific fields to Category Profile
    if (category === 'MARRIAGE') {
      const marriageData = {
        ...(marriageSubCategory && { subCategory: marriageSubCategory as any }),
        ...(familyLivingStatus && { familyLivingStatus: familyLivingStatus as any }),
        ...(familyIncome && { familyIncome: familyIncome as any }),
        ...(fatherName !== undefined && { fatherName }),
        ...(motherName !== undefined && { motherName }),
        ...(brotherCount !== undefined && { brotherCount }),
        ...(sisterCount !== undefined && { sisterCount }),
        ...(relocationPreference && { relocationPreference: relocationPreference as any }),
      };

      if (Object.keys(marriageData).length > 0) {
        await this.prisma.marriageProfile.upsert({
          where: { profileId },
          create: {
            profileId,
            ...marriageData,
          },
          update: {
            ...marriageData,
          },
        });
      }
    }

    // 5. Recalculate score and return the updated profile
    const updatedUser = await this.getMe(userId);
    return updatedUser;
  }

  async upsertPreference(userId: string, dto: UpdatePreferenceDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const profileId = user.profile.id;
    
    const {
      genderPreference,
      smokingHabits,
      drinkingHabits,
      dietPreferences,
      ...basePreferences
    } = dto;

    const preference = await this.prisma.partnerPreference.upsert({
      where: { profileId },
      create: {
        profileId,
        ...basePreferences,
        ...(genderPreference && { genderPreference }),
        ...(smokingHabits && { smokingHabits }),
        ...(drinkingHabits && { drinkingHabits }),
        ...(dietPreferences && { dietPreferences }),
      },
      update: {
        ...basePreferences,
        ...(genderPreference && { genderPreference }),
        ...(smokingHabits && { smokingHabits }),
        ...(drinkingHabits && { drinkingHabits }),
        ...(dietPreferences && { dietPreferences }),
      },
    });

    return preference;
  }

  private calculateCompletionScore(profile: any): number {
    if (!profile) return 0;

    if (profile.category === 'MARRIAGE') {
      return this.calculateMarriageScore(profile);
    }

    return this.calculateLoveScore(profile);
  }

  private calculateMarriageScore(profile: any): number {
    let total = 0;

    // ── 1. Photos (20%) ─────────────────────────────────────────
    const photoCount = profile.photos?.length ?? 0;
    total += photoCount >= 2 ? 20 : photoCount === 1 ? 10 : 0;

    // ── 2. Basic Info (20%) ──────────────────────────────────────
    //    Core identity + lifestyle habits
    const basicFields = [
      'firstName',
      'dateOfBirth',
      'gender',
      'bio',
      'smokingHabit',
      'drinkingHabit',
      'occupation',
      'religionId',   // religion selected at onboarding
    ];
    const basicFilled = basicFields.filter(f => !!profile[f]).length;
    total += (basicFilled / basicFields.length) * 20;

    // ── 3. Marriage Basics (10%) ─────────────────────────────────
    //    Fields collected in the marriage-details onboarding form
    const mp = profile.marriageProfile;
    const marriageBasics = [
      profile.maritalStatus,
      profile.heightCm,
      profile.dietPreference,
      mp?.relocationPreference,
    ];
    const marriageBasicsFilled = marriageBasics.filter(v => !!v).length;
    total += (marriageBasicsFilled / marriageBasics.length) * 10;

    // ── 4. Education & Career (15%) ──────────────────────────────
    const careerFields = [
      profile.educationLevel,
      profile.college,
      profile.workSector,
      profile.workRole ?? profile.occupation,  // whichever is stored
      profile.annualIncome,
    ];
    const careerFilled = careerFields.filter(v => !!v).length;
    total += (careerFilled / careerFields.length) * 15;

    // ── 5. Family Details (15%) ──────────────────────────────────
    const familyFields = [
      mp?.familyLivingStatus,
      mp?.familyIncome,
      mp?.fatherName,
      mp?.motherName,
    ];
    const familyFilled = familyFields.filter(v => !!v).length;
    total += (familyFilled / familyFields.length) * 15;

    // ── 6. Interests / Values (20%) ──────────────────────────────
    //    At least 5 selections = full marks; proportional below
    const interestCount = profile.interests?.length ?? 0;
    total += (Math.min(interestCount, 5) / 5) * 20;

    return Math.round(total);
  }

  private calculateLoveScore(profile: any): number {
    // ── Core (30%) ───────────────────────────────────────────────
    const basicFields = ['firstName', 'dateOfBirth', 'gender', 'bio', 'occupation', 'educationLevel', 'smokingHabit', 'drinkingHabit', 'dietPreference'];
    let coreScore = basicFields.filter(f => !!profile[f]).length;
    const coreTotal = basicFields.length + 1; // +1 for photo

    if (profile.photos && profile.photos.length > 0) coreScore++;
    const corePct = (coreScore / coreTotal) * 30;

    // ── Category (70%) ───────────────────────────────────────────
    let categoryPct = 0;
    if (profile.gender === 'MALE') {
      // Male: 35% Insights + 35% Sync
      const insightAnswered = profile.userAnswers?.filter((a: any) => a.question?.category === 'INSIGHT').length ?? 0;
      const syncAnswered    = profile.userAnswers?.filter((a: any) => a.question?.category === 'SYNCHRONIZATION').length ?? 0;
      categoryPct += (Math.min(insightAnswered, 15) / 15) * 35;
      categoryPct += (Math.min(syncAnswered, 30)    / 30) * 35;
    } else {
      // Female: 70% Sync
      const syncAnswered = profile.userAnswers?.filter((a: any) => a.question?.category === 'SYNCHRONIZATION').length ?? 0;
      categoryPct += (Math.min(syncAnswered, 30) / 30) * 70;
    }

    return Math.round(corePct + categoryPct);
  }

  async addPhoto(userId: string, cdnUrl: string, storageKey: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { profile: { select: { id: true } } },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const profileId = user.profile.id;

    // Get current max display order
    const maxOrderPhoto = await this.prisma.profilePhoto.findFirst({
      where: { profileId },
      orderBy: { displayOrder: 'desc' },
    });

    const nextOrder = maxOrderPhoto ? maxOrderPhoto.displayOrder + 1 : 0;

    const photo = await this.prisma.profilePhoto.create({
      data: {
        profileId,
        cdnUrl,
        storageKey,
        displayOrder: nextOrder,
      },
    });

    return photo;
  }

  async deletePhoto(userId: string, photoId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { profile: { select: { id: true } } },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const profileId = user.profile.id;

    const photo = await this.prisma.profilePhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.profileId !== profileId) {
      throw new NotFoundException('Photo not found or does not belong to user');
    }

    await this.prisma.profilePhoto.delete({
      where: { id: photoId },
    });

    return { success: true };
  }

  async reorderPhotos(userId: string, photoIds: string[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { profile: { select: { id: true } } },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const profileId = user.profile.id;

    // Wrap in transaction
    await this.prisma.$transaction(
      photoIds.map((id, index) => 
        this.prisma.profilePhoto.update({
          where: { id, profileId },
          data: { displayOrder: index },
        })
      )
    );

    return { success: true };
  }

  async setPrimaryPhoto(userId: string, photoId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { profile: { select: { id: true } } },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const profileId = user.profile.id;

    const photo = await this.prisma.profilePhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.profileId !== profileId) {
      throw new NotFoundException('Photo not found or does not belong to user');
    }

    // Transaction: clear all isPrimary, then set the chosen one
    await this.prisma.$transaction([
      this.prisma.profilePhoto.updateMany({
        where: { profileId },
        data: { isPrimary: false },
      }),
      this.prisma.profilePhoto.update({
        where: { id: photoId },
        data: { isPrimary: true },
      }),
    ]);

    return { success: true, photoId };
  }

  async getOnboardingFields(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const { category } = user.profile;
    const modelName = category === 'LOVE' ? 'LoveProfile' : 'MarriageProfile';

    const model = Prisma.dmmf.datamodel.models.find((m) => m.name === modelName);
    if (!model) throw new BadRequestException(`Model ${modelName} not found in DMMF`);

    // Find all fields that are Enums and start with 'testQuestion'
    const testFields = model.fields.filter(
      (f) => f.kind === 'enum' && f.name.startsWith('testQuestion')
    );

    // Get the options for each enum from the @prisma/client exports
    const fieldsWithOptions = testFields.map((field) => {
      const enumObj = (prismaClient as any)[field.type];
      
      // Formatting 'testQuestion1' to 'Test Question 1'
      const humanReadableName = field.name
        .replace(/([A-Z])/g, ' $1')
        .replace(/(\d+)/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      return {
        key: field.name,
        question: humanReadableName,
        type: field.type,
        options: enumObj ? Object.values(enumObj) : [],
      };
    });

    return fieldsWithOptions;
  }

  async getPublicProfile(profileId: string) {
    const p = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: true,
        photos: { orderBy: { displayOrder: 'asc' } },
        interests: { include: { interest: true } },
        religion: true,
        loveProfile: {
          include: {
            sparkProfile: {
              include: {
                activeVersion: {
                  include: {
                    questions: {
                      orderBy: { displayOrder: 'asc' }
                    }
                  }
                }
              }
            }
          }
        },
        marriageProfile: true,
        userAnswers: true,
      }
    });

    if (!p) throw new NotFoundException('Profile not found');

    const isMarriage = p.category === 'MARRIAGE';
    const name = isMarriage && p.lastName 
      ? `${p.firstName} ${p.lastName}`
      : p.firstName || 'Anonymous';

    const main_photo = p.photos && p.photos.length > 0 ? p.photos[0].cdnUrl : null;
    const photos = p.photos && p.photos.length > 0 
      ? p.photos.map((ph: any) => ph.cdnUrl) 
      : [];
      
    const interests = p.interests ? p.interests.map((ui: any) => ui.interest?.name || 'General') : [];
    
    let tagline = undefined;
    let about = p.bio || undefined;
    let children = undefined;

    if (p.loveProfile) {
      tagline = (p.loveProfile as any).tagline || undefined;
    }
    if (p.marriageProfile) {
      children = (p.marriageProfile as any).children || undefined;
    }

    const catProfile = p.loveProfile || p.marriageProfile;
    let sparkQuestions: any = undefined;
    
    const activeQuestions = (p.loveProfile as any)?.sparkProfile?.activeVersion?.questions;
    if (activeQuestions && activeQuestions.length > 0) {
      sparkQuestions = {
        q1: activeQuestions[0]?.text || undefined,
        q2: activeQuestions[1]?.text || undefined,
        q3: activeQuestions[2]?.text || undefined,
      };
    } else if (catProfile) {
      sparkQuestions = {
        q1: (catProfile as any).testQuestion1 || undefined,
        q2: (catProfile as any).testQuestion2 || undefined,
        q3: (catProfile as any).testQuestion3 || undefined,
      };
    }

    // Determine match score based on basic similarities (mocked for now, 75-98)
    const matchScore = Math.floor(Math.random() * (98 - 75 + 1) + 75);

    // Calculate age from DOB
    let age = 24; // fallback
    if (p.dateOfBirth) {
      const diffMs = Date.now() - new Date(p.dateOfBirth).getTime();
      age = Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
    }

    return {
      id: p.id,
      name,
      age,
      gender: p.gender || 'Female',
      distance: `0 km away`,
      distanceNum: 0,
      liked: false,
      recentlyActive: true,
      religion: p.religion?.name || undefined,
      location: (p as any).city ? `${(p as any).city}` : 'Nearby',
      match: matchScore,
      interests,
      main_photo,
      photos,
      verified: true,
      occupation: p.occupation || 'Professional',
      about: about || 'Hey there! I am using ParaPixel.',
      height: p.heightCm ? `${Math.floor(p.heightCm)} cm` : undefined,
      zodiac: (p as any).zodiac || undefined,
      education: p.educationLevel || undefined,
      drinking: p.drinkingHabit || undefined,
      smoking: p.smokingHabit || undefined,
      children,
      pronouns: (p as any).pronouns || undefined,
      tagline,
      sparkQuestions,
      category: p.category,
      marriageProfile: p.marriageProfile,
      loveProfile: p.loveProfile,
    };
  }

  async getReligions() {
    return this.prisma.religion.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async getInterests(category?: string) {
    return this.prisma.interest.findMany({
      where: { 
        isActive: true,
        ...(category ? { category } : {})
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    
    if (!wallet) {
      // Auto-create wallet if it doesn't exist to prevent 0 balance errors
      wallet = await this.prisma.wallet.create({
        data: { userId, balance: 100 }
      });
      await this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: 100,
          type: 'EARN',
          description: 'Initial signup bonus (auto-fix)'
        }
      });
    }
    
    return wallet;
  }

  async earnCoins(userId: string, amount: number, description: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    
    if (!wallet) throw new NotFoundException('Wallet not found');

    const [updatedWallet] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } }
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'EARN',
          description,
        }
      })
    ]);

    return updatedWallet;
  }

  async getQuestions(category: string) {
    return this.prisma.question.findMany({
      where: { category: category as prismaClient.QuestionCategory },
      orderBy: { displayOrder: 'asc' }
    });
  }

  async submitAnswers(userId: string, answers: { questionId: string, answer: string }[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const profileId = user.profile.id;

    for (const ans of answers) {
      await this.prisma.userAnswer.upsert({
        where: {
          profileId_questionId: {
            profileId,
            questionId: ans.questionId
          }
        },
        create: {
          profileId,
          questionId: ans.questionId,
          answer: ans.answer
        },
        update: {
          answer: ans.answer
        }
      });
    }

    return this.getMe(userId);
  }

  async deleteAccount(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete verifications
      await tx.userVerification.deleteMany({ where: { userId } });
      
      // 2. Delete profile (which cascades to sub-profiles)
      const profile = await tx.profile.findUnique({ where: { userId } });
      if (profile) {
        await tx.profile.delete({ where: { id: profile.id } });
      }

      // 3. Delete user (which cascades to sessions, devices, wallets)
      await tx.user.delete({ where: { id: userId } });
    });
    return { success: true };
  }
}
