import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import { v4 as uuid } from 'uuid';

import { AppConfigService } from '../config/config.service';
import { DatabaseService } from '../common/database/database.service';
import { FirebaseService } from '../common/firebase/firebase.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { DevicePlatform, CategoryType } from '@prisma/client';

// ─── Onboarding step is COMPUTED — not stored in DB ───────────────────────────
// Derived from what data already exists for the user's profile.
export type OnboardingStep =
  | 'PHONE_VERIFIED'  // User + phone exist, no Profile row yet
  | 'DETAILS_DONE'    // Profile exists but no category set
  | 'CATEGORY_DONE'   // Profile has category, but details not completed
  | 'COMPLETED';      // Fully onboarded with all sub-profile details

export interface AuthUserResponse {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  onboardingStep: OnboardingStep;
  category?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
    private readonly database: DatabaseService,
    private readonly firebase: FirebaseService,
  ) { }

  // ─── Token Generation ────────────────────────────────────────────────────

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.config.jwtAccessSecret,
      expiresIn: '15m',
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.config.jwtRefreshSecret,
      expiresIn: '30d',
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // ─── Onboarding Step Computation ────────────────────────────────────────

  private computeOnboardingStep(profile: any): OnboardingStep {
    if (!profile) return 'PHONE_VERIFIED';
    if (profile.onboardingStatus) return 'COMPLETED';
    if (!profile.category) return 'DETAILS_DONE';
    
    return 'CATEGORY_DONE';
  }

  // ─── Firebase Login (Sign Up + Login) ───────────────────────────────────
  // Called once after both Google Sign-In AND Phone OTP are verified.
  // Works for both new users (sign up) and returning users (login).

  async firebaseLogin(
    googleIdToken: string,
    phoneIdToken: string | undefined,
    device: {
      deviceId?: string;
      platform?: DevicePlatform;
      deviceName?: string;
    },
  ): Promise<AuthResponse> {
    // 1. Verify Google token
    const googleUser = await this.firebase.verifyIdToken(googleIdToken);

    if (!googleUser.email) {
      throw new UnauthorizedException('Google account must have an email address');
    }

    let phoneNumber: string | null = null;

    // 2. Verify Phone token if provided
    if (phoneIdToken) {
      const phoneUser = await this.firebase.verifyIdToken(phoneIdToken);
      if (!phoneUser.phoneNumber) {
        throw new UnauthorizedException('Phone token must contain a verified phone number');
      }
      phoneNumber = phoneUser.phoneNumber;
    }

    // 3. Find or create User
    const user = await this.findOrCreateUser({
      firebaseUid: googleUser.uid,
      email: googleUser.email,
      phoneNumber,
    });

    // 3. Compute onboarding step from profile state
    const profile = await this.database.profile.findUnique({
      where: { userId: user.id },
      include: { loveProfile: true, marriageProfile: true },
    });

    const primaryPhoto = profile
      ? await this.database.profilePhoto.findFirst({
        where: { profileId: profile.id },
        orderBy: { displayOrder: 'asc' },
        select: { cdnUrl: true },
      })
      : null;

    const onboardingStep = this.computeOnboardingStep(profile);

    // 4. Find or create device (generate server-side ID if client didn't send one)
    const resolvedDeviceId = device.deviceId ?? uuid();
    const userDevice = await this.findOrCreateDevice(user.id, {
      deviceId: resolvedDeviceId,
      platform: device.platform ?? DevicePlatform.ANDROID,
      deviceName: device.deviceName,
    });

    // 5. Build JWT payload and generate tokens
    const sessionId = uuid();
    const payload: JwtPayload = {
      sub: user.id,
      sessionId,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    // 6. Persist session
    await this.createSession(sessionId, user.id, userDevice.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: profile?.firstName ?? null,
        photoURL: primaryPhoto?.cdnUrl ?? null,
        onboardingStep,
        category: profile?.category ?? null,
      },
    };
  }

  // ─── Get Current User ────────────────────────────────────────────────────

  async getMe(userId: string): Promise<AuthUserResponse> {
    const user = await this.database.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const profile = await this.database.profile.findUnique({
      where: { userId },
      include: { loveProfile: true, marriageProfile: true },
    });

    const primaryPhoto = profile
      ? await this.database.profilePhoto.findFirst({
        where: { profileId: profile.id },
        orderBy: { displayOrder: 'asc' },
        select: { cdnUrl: true },
      })
      : null;

    const onboardingStep = this.computeOnboardingStep(profile);

    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      displayName: profile?.firstName ?? null,
      photoURL: primaryPhoto?.cdnUrl ?? null,
      onboardingStep,
      category: profile?.category ?? null,
    };
  }

  // ─── Refresh Token ────────────────────────────────────────────────────────

  async refreshTokens(incomingRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const hash = this.hashToken(incomingRefreshToken);

    const session = await this.database.session.findFirst({
      where: {
        refreshTokenHash: hash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: { select: { id: true, role: true } } },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload: JwtPayload = {
      sub: session.user.id,
      sessionId: session.id,
      role: session.user.role,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    // Rotate: update session with new hash and lastUsedAt
    await this.database.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: this.hashToken(newRefreshToken),
        lastUsedAt: new Date(),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(sessionId: string): Promise<void> {
    await this.database.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private async findOrCreateUser(data: {
    firebaseUid: string;
    email: string;
    phoneNumber: string | null;
  }) {
    const existing = await this.database.user.findUnique({
      where: { firebaseUid: data.firebaseUid },
    });

    if (existing) {
      // Update phone/email in case they changed
      return this.database.user.update({
        where: { id: existing.id },
        data: {
          email: data.email,
          ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
          lastActiveAt: new Date(),
        },
      });
    }

    // If new user, phone number is strictly required
    if (!data.phoneNumber) {
      throw new BadRequestException('PHONE_REQUIRED');
    }

    // Check if the phone number is already registered to another account
    const existingPhone = await this.database.user.findUnique({
      where: { phoneNumber: data.phoneNumber },
    });

    if (existingPhone) {
      throw new ConflictException('PHONE_ALREADY_IN_USE');
    }

    return this.database.user.create({
      data: {
        firebaseUid: data.firebaseUid,
        email: data.email,
        phoneNumber: data.phoneNumber,
        lastActiveAt: new Date(),
        wallet: {
          create: {
            balance: 100, // Default signup coins
          }
        }
      },
    });
  }

  private async findOrCreateDevice(
    userId: string,
    device: { deviceId: string; platform: DevicePlatform; deviceName?: string },
  ) {
    const existing = await this.database.device.findUnique({
      where: { userId_clientDeviceId: { userId, clientDeviceId: device.deviceId } },
    });

    if (existing) {
      return this.database.device.update({
        where: { id: existing.id },
        data: {
          platform: device.platform,
          deviceName: device.deviceName,
          lastActiveAt: new Date(),
        },
      });
    }

    return this.database.device.create({
      data: {
        userId,
        clientDeviceId: device.deviceId,
        platform: device.platform,
        deviceName: device.deviceName,
        lastActiveAt: new Date(),
      },
    });
  }

  private async createSession(
    sessionId: string,
    userId: string,
    deviceId: string,
    refreshToken: string,
  ) {
    return this.database.session.create({
      data: {
        id: sessionId,
        userId,
        deviceId,
        refreshTokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastUsedAt: new Date(),
      },
    });
  }
}
