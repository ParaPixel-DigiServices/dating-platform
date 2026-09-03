import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CategoryType, Gender } from '@prisma/client';
import { DatabaseService } from '../common/database/database.service';
import { SaveDetailsDto, FrontendGender } from './dto/save-details.dto';
import { SaveCategoryDto } from './dto/save-category.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly database: DatabaseService) { }

  // ─── Save Details ─────────────────────────────────────────────────────────
  // Creates the Profile row if it doesn't exist, updates if it does.

  async saveDetails(userId: string, dto: SaveDetailsDto) {
    // Map frontend gender enum to Prisma Gender enum
    const genderMap: Record<FrontendGender, Gender> = {
      [FrontendGender.MALE]: Gender.MALE,
      [FrontendGender.FEMALE]: Gender.FEMALE,
      [FrontendGender.NON_BINARY]: Gender.OTHER,
    };

    await this.database.profile.upsert({
      where: { userId },
      create: {
        userId,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: genderMap[dto.gender],
      },
      update: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: genderMap[dto.gender],
      },
    });

    return { success: true, onboardingStep: 'DETAILS_DONE' };
  }

  // ─── Save Category ────────────────────────────────────────────────────────
  // Sets profile category + creates the appropriate sub-profile.
  // Enforces the invariant: only LoveProfile OR MarriageProfile can exist.

  async saveCategory(userId: string, dto: SaveCategoryDto) {
    const profile = await this.database.profile.findUnique({
      where: { userId },
      include: { loveProfile: true, marriageProfile: true },
    });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found. Complete basic details first.',
      );
    }

    if (dto.category === CategoryType.LOVE) {
      await this._setLoveCategory(profile);
    } else {
      await this._setMarriageCategory(profile, dto.subCategory!);
    }

    return { success: true, onboardingStep: 'CATEGORY_DONE' };
  }

  // ─── Private: Love ────────────────────────────────────────────────────────

  private async _setLoveCategory(profile: {
    id: string;
    loveProfile: { id: string } | null;
    marriageProfile: { id: string } | null;
  }) {
    await this.database.$transaction(async (tx) => {
      // Remove MarriageProfile if it accidentally exists
      if (profile.marriageProfile) {
        await tx.marriageProfile.delete({ where: { profileId: profile.id } });
      }

      // Set category
      await tx.profile.update({
        where: { id: profile.id },
        data: {
          category: CategoryType.LOVE,
          onboardingStatus: true,
        },
      });

      // Create LoveProfile if not already there
      if (!profile.loveProfile) {
        await tx.loveProfile.create({ data: { profileId: profile.id } });
      }
    });
  }

  // ─── Private: Marriage ────────────────────────────────────────────────────

  private async _setMarriageCategory(
    profile: {
      id: string;
      loveProfile: { id: string } | null;
      marriageProfile: { id: string } | null;
    },
    subCategory: string,
  ) {
    // Look up Religion from seed data (case-insensitive)
    const religion = await this.database.religion.findFirst({
      where: { name: { equals: subCategory, mode: 'insensitive' } },
    });

    if (!religion) {
      throw new BadRequestException(
        `Unknown religion: "${subCategory}". Check the sub-category value.`,
      );
    }

    await this.database.$transaction(async (tx) => {
      // Remove LoveProfile if it accidentally exists
      if (profile.loveProfile) {
        await tx.loveProfile.delete({ where: { profileId: profile.id } });
      }

      // Set category + religion on profile
      await tx.profile.update({
        where: { id: profile.id },
        data: {
          category: CategoryType.MARRIAGE,
          religionId: religion.id,
        },
      });

      // Create MarriageProfile if not already there
      if (!profile.marriageProfile) {
        await tx.marriageProfile.create({ data: { profileId: profile.id } });
      }
    });
  }

  async saveMarriageDetails(userId: string, data: any) {
    const profile = await this.database.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const mappedData = {
      maritalStatus: data.maritalStatus,
      heightCm: data.heightCm ? parseInt(data.heightCm, 10) || null : null,
      educationLevel: data.education,
      college: data.college,
      annualIncome: data.annualIncome,
      workSector: data.workSector,
      occupation: data.workRole,
      companyName: data.workCompany,
    };

    try {
      // Update base profile with shared fields
      await this.database.profile.update({
        where: { id: profile.id },
        data: {
          maritalStatus: mappedData.maritalStatus,
          heightCm: mappedData.heightCm,
          educationLevel: mappedData.educationLevel,
          college: mappedData.college,
          annualIncome: mappedData.annualIncome,
          workSector: mappedData.workSector,
          occupation: mappedData.occupation,
          companyName: mappedData.companyName,
          dietPreference: data.diet,
          completionPercentage: 100,
          isCompleted: true,
          onboardingStatus: true,
        }
      });

      const familyLivingStatus = data.family;
      const familyIncome = data.familyIncome;
      const relocationPreference = data.relocationPreference;

      // Create or Update MarriageProfile
      const brotherCount = parseInt(data.brotherCount, 10) || 0;
      const sisterCount = parseInt(data.sisterCount, 10) || 0;

      const marriageProfile = await this.database.marriageProfile.upsert({
        where: { profileId: profile.id },
        update: {
          familyLivingStatus: familyLivingStatus,
          familyIncome: familyIncome,
          fatherName: data.fatherName,
          motherName: data.motherName,
          brotherCount: brotherCount,
          sisterCount: sisterCount,
          relocationPreference: relocationPreference,
        },
        create: {
          profileId: profile.id,
          familyLivingStatus: familyLivingStatus,
          familyIncome: familyIncome,
          fatherName: data.fatherName,
          motherName: data.motherName,
          brotherCount: brotherCount,
          sisterCount: sisterCount,
          relocationPreference: relocationPreference,
        }
      });

      // Save interests if provided
      if (data.interests && Array.isArray(data.interests)) {
        await this.database.userInterest.deleteMany({
          where: { profileId: profile.id }
        });
        
        if (data.interests.length > 0) {
          await this.database.userInterest.createMany({
            data: data.interests.map((interestId: string) => ({
              profileId: profile.id,
              interestId: interestId
            }))
          });
        }
      }

      // Create default PartnerPreference if it doesn't exist
      const oppositeGender = profile.gender === 'MALE' ? 'FEMALE' : (profile.gender === 'FEMALE' ? 'MALE' : null);
      const genderPref = oppositeGender ? [oppositeGender] : [];
      const userHeight = mappedData.heightCm || 170;

      await this.database.partnerPreference.upsert({
        where: { profileId: profile.id },
        update: {},
        create: {
          profileId: profile.id,
          genderPreference: genderPref as any,
          minHeightCm: userHeight - 30, // Approx -1ft
          maxHeightCm: userHeight + 30, // Approx +1ft
        }
      });

      // Onboarding step is computed in auth service, no need to update user table.
      return { success: true, onboardingStep: 'COMPLETED', data: marriageProfile };
    } catch (error) {
      Logger.error('FAILED TO SAVE MARRIAGE DETAILS:', error, OnboardingService.name);
      throw error;
    }
  }
}
