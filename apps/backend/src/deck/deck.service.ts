import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { CategoryType } from '@prisma/client';

@Injectable()
export class DeckService {
  constructor(private readonly prisma: DatabaseService) {}

  async getDeck(userId: string) {
    // Get user's category and interacted IDs
    // Get user's category, interacted IDs, and preferences
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { include: { partnerPreference: true } } }
    });

    if (!currentUser || !currentUser.profile) {
      return [];
    }

    const currentProfileId = currentUser.profile.id;
    const currentCategory = currentUser.profile.category;
    
    // Find who this user has already swiped on
    const interactions = await this.prisma.profileInteraction.findMany({
      where: { fromProfileId: currentProfileId },
      select: { toProfileId: true }
    });
    const interactedProfileIds = interactions.map(i => i.toProfileId);

    // Also exclude blocked users (based on profile IDs)
    const blocks = await this.prisma.block.findMany({
      where: { OR: [{ blockerProfileId: currentProfileId }, { blockedProfileId: currentProfileId }] },
    });
    const blockedProfileIds = blocks.map(b => b.blockerProfileId === currentProfileId ? b.blockedProfileId : b.blockerProfileId);

    // Filter by opposite gender (unless overridden)
    const myGender = currentUser.profile.gender?.toLowerCase();
    let targetGender: any = undefined;
    if (myGender === 'male') targetGender = 'FEMALE';
    if (myGender === 'female') targetGender = 'MALE';

    // Age filtering logic
    const preferences = currentUser.profile.partnerPreference;
    let minDateOfBirth: Date | undefined;
    let maxDateOfBirth: Date | undefined;
    
    if (preferences) {
      const today = new Date();
      // If maxAge is 30, the user must be born AFTER (today - 30 years)
      if (preferences.maxAge) {
        minDateOfBirth = new Date(today.getFullYear() - preferences.maxAge, today.getMonth(), today.getDate());
      }
      // If minAge is 19, the user must be born BEFORE (today - 19 years)
      if (preferences.minAge) {
        maxDateOfBirth = new Date(today.getFullYear() - preferences.minAge, today.getMonth(), today.getDate());
      }
    }

    // Fetch potential matches matching the category
    // To keep it simple for the MVP, we just fetch active profiles that are fully onboarded
    const rawProfiles = await this.prisma.profile.findMany({
      where: {
        id: { notIn: [currentProfileId, ...interactedProfileIds, ...blockedProfileIds] },
        userId: { notIn: [userId] },
        category: currentCategory,
        ...(targetGender ? { gender: targetGender } : {}),
        ...(minDateOfBirth || maxDateOfBirth ? {
          dateOfBirth: {
            ...(minDateOfBirth ? { gte: minDateOfBirth } : {}),
            ...(maxDateOfBirth ? { lte: maxDateOfBirth } : {})
          }
        } : {})
      },
      take: 10,
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

    return rawProfiles.map(p => this.mapProfileToFrontend(p));
  }

  private mapProfileToFrontend(p: any) {
    const isMarriage = p.category === CategoryType.MARRIAGE;
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
    
    // Extract real spark questions if available
    const activeQuestions = p.loveProfile?.sparkProfile?.activeVersion?.questions;
    if (activeQuestions && activeQuestions.length > 0) {
      sparkQuestions = {
        q1: activeQuestions[0]?.text || undefined,
        q2: activeQuestions[1]?.text || undefined,
        q3: activeQuestions[2]?.text || undefined,
      };
    } else if (catProfile) {
      // Fallback to testQuestions for legacy or mock data compatibility
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
    } else if (p.dob) { // just in case the field was named dob in some places
      const diffMs = Date.now() - new Date(p.dob).getTime();
      age = Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
    }

    return {
      id: p.id, // TARGET profile ID
      name,
      age,
      gender: p.gender || 'Female',
      distance: `0 km away`, // As requested by user
      distanceNum: 0,
      liked: false,
      recentlyActive: true,
      religion: p.religion?.name || undefined,
      location: p.city ? `${p.city}` : 'Nearby',
      match: matchScore,
      interests,
      main_photo,
      photos,
      verified: true,
      occupation: p.occupation || 'Professional',
      about: about || 'Hey there! I am using ParaPixel.',
      height: p.heightCm ? `${Math.floor(p.heightCm)} cm` : undefined,
      zodiac: p.zodiac || undefined,
      education: p.educationLevel || undefined,
      drinking: p.drinkingHabit || undefined,
      smoking: p.smokingHabit || undefined,
      children,
      pronouns: p.pronouns || undefined,
      tagline,
      sparkQuestions,
      category: p.category,
      annualIncome: p.annualIncome || undefined,
      relocationPreference: p.marriageProfile?.relocationPreference || undefined,
      familyType: p.marriageProfile?.familyType || undefined,
    };
  }
}
