import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class InteractionService {
  constructor(private readonly prisma: DatabaseService) {}

  async getActivitySummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    const myProfileId = user.profile.id;

    // Fetch all interactions involving this user
    const interactions = await this.prisma.profileInteraction.findMany({
      where: {
        OR: [
          { fromProfileId: myProfileId },
          { toProfileId: myProfileId }
        ],
        interactionType: {
          in: ['LIKE', 'SUPER_LIKE', 'SPARK']
        }
      },
      include: {
        fromProfile: {
          include: { user: true }
        },
        toProfile: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Helper to format a profile for the frontend mini card
    const formatProfile = (profile: any, interactionId: string, timestamp: Date) => ({
      id: profile.id,
      name: profile.user?.displayName || profile.firstName,
      age: profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : null,
      occupation: profile.occupation || null,
      avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].cdnUrl : null,
      timestamp: timestamp.getTime(),
      interactionId
    });

    const incomingLikes: any[] = [];
    const outgoingLikes: any[] = [];
    const incomingSuperLikes: any[] = [];
    const outgoingSuperLikes: any[] = [];
    const incomingSparks: any[] = [];
    const outgoingSparks: any[] = [];

    for (const inter of interactions) {
      if (inter.toProfileId === myProfileId) {
        // Incoming
        if (inter.interactionType === 'LIKE') {
          incomingLikes.push(formatProfile(inter.fromProfile, inter.id, inter.createdAt));
        } else if (inter.interactionType === 'SUPER_LIKE') {
          incomingSuperLikes.push(formatProfile(inter.fromProfile, inter.id, inter.createdAt));
        } else if (inter.interactionType === 'SPARK') {
          incomingSparks.push(formatProfile(inter.fromProfile, inter.id, inter.createdAt));
        }
      } else {
        // Outgoing
        if (inter.interactionType === 'LIKE') {
          outgoingLikes.push(formatProfile(inter.toProfile, inter.id, inter.createdAt));
        } else if (inter.interactionType === 'SUPER_LIKE') {
          outgoingSuperLikes.push(formatProfile(inter.toProfile, inter.id, inter.createdAt));
        } else if (inter.interactionType === 'SPARK') {
          outgoingSparks.push(formatProfile(inter.toProfile, inter.id, inter.createdAt));
        }
      }
    }

    // Fetch matches for this user
    const dbMatches = await this.prisma.match.findMany({
      where: {
        OR: [
          { profileOneId: myProfileId },
          { profileTwoId: myProfileId }
        ],
        unmatchedAt: null
      },
      include: {
        profileOne: { include: { user: true, photos: true } },
        profileTwo: { include: { user: true, photos: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const matches: any[] = [];
    for (const match of dbMatches) {
      const otherProfile = match.profileOneId === myProfileId ? match.profileTwo : match.profileOne;
      matches.push(formatProfile(otherProfile, match.id, match.createdAt));
    }

    return {
      incomingLikes,
      outgoingLikes,
      incomingSuperLikes,
      outgoingSuperLikes,
      incomingSparks,
      outgoingSparks,
      matches,
    };
  }

  async swipe(userId: string, targetProfileId: string, type: 'LIKE' | 'PASS' | 'SUPER_LIKE') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!user.profile.onboardingStatus) {
      throw new BadRequestException('Your profile must be completed to interact with others.');
    }

    const myProfileId = user.profile.id;

    const targetProfile = await this.prisma.profile.findUnique({
      where: { id: targetProfileId }
    });

    if (!targetProfile) {
      throw new NotFoundException('Target profile not found');
    }

    if (targetProfile.category !== user.profile.category) {
      throw new BadRequestException('You cannot interact with profiles from a different category.');
    }

    // Record interaction (upsert allows changing PASS to LIKE later)
    await this.prisma.profileInteraction.upsert({
      where: {
        fromProfileId_toProfileId: {
          fromProfileId: myProfileId,
          toProfileId: targetProfileId
        }
      },
      update: { interactionType: type },
      create: {
        fromProfileId: myProfileId,
        toProfileId: targetProfileId,
        interactionType: type
      }
    });

    if (type === 'LIKE') {
      // Check if target has already liked me
      const reciprocal = await this.prisma.profileInteraction.findUnique({
        where: {
          fromProfileId_toProfileId: {
            fromProfileId: targetProfileId,
            toProfileId: myProfileId
          }
        }
      });

      if (reciprocal && (reciprocal.interactionType === 'LIKE' || reciprocal.interactionType === 'SUPER_LIKE')) {
        // MATCH!
        // Check if match already exists
        const existingMatch = await this.prisma.match.findFirst({
          where: {
            OR: [
              { profileOneId: myProfileId, profileTwoId: targetProfileId },
              { profileOneId: targetProfileId, profileTwoId: myProfileId }
            ]
          }
        });

        if (!existingMatch) {
          const match = await this.prisma.match.create({
            data: {
              profileOneId: myProfileId,
              profileTwoId: targetProfileId,
            }
          });
          return { matched: true, matchId: match.id };
        }
      }
    }

    return { matched: false };
  }
}
