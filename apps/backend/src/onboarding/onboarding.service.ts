import { Injectable } from '@nestjs/common';

import {
  OnboardingStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { OnboardingDetailsDto } from './dto/onboarding-details.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async saveDetails(
    userId: string,
    dto: OnboardingDetailsDto,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const profile =
          await tx.profile.upsert({
            where: {
              userId,
            },

            update: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              dateOfBirth: new Date(
                dto.dateOfBirth,
              ),
              gender: dto.gender,
            },

            create: {
              userId,
              firstName: dto.firstName,
              lastName: dto.lastName,
              dateOfBirth: new Date(
                dto.dateOfBirth,
              ),
              gender: dto.gender,
            },
          });

        await tx.user.update({
          where: {
            id: userId,
          },

          data: {
            onboardingStatus:
              OnboardingStatus.IN_PROGRESS,
          },
        });

        await tx.onboardingProgress.upsert({
          where: {
            userId,
          },

          update: {
            currentStep: 1,
            completedSteps: [
              'details',
            ],
          },

          create: {
            userId,
            currentStep: 1,
            completedSteps: [
              'details',
            ],
          },
        });

        return {
          success: true,
          profile,
        };
      },
    );
  }
}