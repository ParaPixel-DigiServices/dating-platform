import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

interface ActiveCall {
  matchId: string;
  callerId: string;
  calleeId: string;
  status: 'RINGING' | 'ACCEPTED';
  createdAt: number;
}

@Injectable()
export class CallService {
  private activeCalls = new Map<string, ActiveCall>(); // key: matchId

  constructor(private readonly prisma: DatabaseService) {}

  async validateAndCreateCall(callerId: string, matchId: string): Promise<ActiveCall> {
    // 1. Verify match exists and both users are part of it
    const match = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { profileOne: { userId: callerId } },
          { profileTwo: { userId: callerId } }
        ]
      },
      include: {
        profileOne: true,
        profileTwo: true,
      }
    });

    if (!match) {
      throw new BadRequestException('Match not found or unauthorized');
    }

    const callerProfile = match.profileOne.userId === callerId ? match.profileOne : match.profileTwo;
    const calleeProfile = match.profileOne.userId === callerId ? match.profileTwo : match.profileOne;
    const calleeId = calleeProfile.userId;

    // 2. Check if blocked
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerProfileId: callerProfile.id, blockedProfileId: calleeProfile.id },
          { blockerProfileId: calleeProfile.id, blockedProfileId: callerProfile.id }
        ]
      }
    });

    if (block) {
      throw new BadRequestException('Cannot call this user');
    }

    // 3. Ensure neither is in an active call
    for (const call of this.activeCalls.values()) {
      if (call.callerId === callerId || call.calleeId === callerId) {
        throw new BadRequestException('You are already in a call');
      }
      if (call.callerId === calleeId || call.calleeId === calleeId) {
        throw new BadRequestException('User is busy on another call');
      }
    }

    // 4. Create active call record
    const newCall: ActiveCall = {
      matchId,
      callerId,
      calleeId,
      status: 'RINGING',
      createdAt: Date.now()
    };
    
    this.activeCalls.set(matchId, newCall);
    return newCall;
  }

  getCall(matchId: string): ActiveCall | undefined {
    return this.activeCalls.get(matchId);
  }

  updateCallStatus(matchId: string, status: ActiveCall['status']) {
    const call = this.activeCalls.get(matchId);
    if (call) {
      call.status = status;
      this.activeCalls.set(matchId, call);
    }
  }

  endCall(matchId: string) {
    this.activeCalls.delete(matchId);
  }

  cleanStaleCalls() {
    const now = Date.now();
    for (const [matchId, call] of this.activeCalls.entries()) {
      // If ringing for more than 60 seconds, clear it
      if (call.status === 'RINGING' && now - call.createdAt > 60000) {
        this.activeCalls.delete(matchId);
      }
    }
  }
}
