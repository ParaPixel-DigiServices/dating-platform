import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class SparkService {
  constructor(private readonly prisma: DatabaseService) {}

  async getQuestions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
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
            }
          }
        }
      }
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const sparkProfile = user.profile.loveProfile?.sparkProfile;
    if (!sparkProfile || !sparkProfile.activeVersion) {
      return [];
    }

    return sparkProfile.activeVersion.questions.map(q => ({
      id: q.id,
      text: q.text,
      displayOrder: q.displayOrder,
      isRequired: q.isRequired
    }));
  }

  async upsertQuestions(userId: string, questions: string[]) {
    if (!questions || questions.length === 0 || questions.length > 3) {
      throw new BadRequestException('You must provide between 1 and 3 questions.');
    }

    // 1. Fetch user and profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            loveProfile: {
              include: {
                sparkProfile: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    if (user.profile.category !== 'LOVE') {
      throw new BadRequestException('Spark questions are only available for Love profiles.');
    }

    // 2. Ensure LoveProfile exists
    let loveProfileId = user.profile.loveProfile?.id;
    if (!loveProfileId) {
      const newLoveProfile = await this.prisma.loveProfile.create({
        data: {
          profileId: user.profile.id
        }
      });
      loveProfileId = newLoveProfile.id;
    }

    // 3. Ensure SparkProfile exists
    let sparkProfile = user.profile.loveProfile?.sparkProfile;
    if (!sparkProfile) {
      sparkProfile = await this.prisma.sparkProfile.create({
        data: {
          loveProfileId: loveProfileId,
          maxQuestions: 3
        }
      });
    }

    // 4. Get the latest version number
    const latestVersion = await this.prisma.sparkProfileVersion.findFirst({
      where: { sparkProfileId: sparkProfile.id },
      orderBy: { versionNumber: 'desc' }
    });
    
    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // 5. Create new SparkProfileVersion and questions in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Create version
      const newVersion = await tx.sparkProfileVersion.create({
        data: {
          sparkProfileId: sparkProfile.id,
          versionNumber: nextVersionNumber,
          questions: {
            create: questions.map((text, index) => ({
              text,
              displayOrder: index,
              isRequired: true
            }))
          }
        }
      });

      // Update active version
      await tx.sparkProfile.update({
        where: { id: sparkProfile.id },
        data: { activeVersionId: newVersion.id }
      });
    });

    return { success: true, message: 'Spark questions updated successfully.' };
  }
}
