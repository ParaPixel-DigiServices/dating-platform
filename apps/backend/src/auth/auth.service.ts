import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

import { FirebaseService } from '../firebase/firebase.service';

import { FirebaseLoginDto } from './dto/firebase-login.dto';

import { CompletePhoneVerificationDto } from './dto/complete-phone-verification.dto';

import { AuthResponseType } from './types/auth-response.type';

import { mapFirebaseProvider } from './utils/map-firebase-provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,

    private readonly jwtService: JwtService,

    private readonly firebaseService: FirebaseService,
  ) { }

  async loginWithFirebase(
    dto: FirebaseLoginDto,
  ): Promise<AuthResponseType> {
    try {
      const decodedToken =
        await this.firebaseService.verifyIdToken(
          dto.idToken,
        );

        console.log('Decoded Firebase token:', decodedToken);

      const firebaseProvider =
        decodedToken.firebase.sign_in_provider;

      console.log('Firebase sign-in provider:', firebaseProvider);

      const authProvider =
        mapFirebaseProvider(firebaseProvider);

      const isPhoneProvider =
        firebaseProvider === 'phone';

      const phoneNumber =
        decodedToken.phone_number ?? null;

      const email =
        decodedToken.email ?? null;

      if (!isPhoneProvider && email) {
        const existingUser =
          await this.prismaService.user.findUnique({
            where: {
              email,
            },
          });

        if (
          existingUser &&
          existingUser.phoneVerified
        ) {
          const accessToken =
            await this.jwtService.signAsync({
              sub: existingUser.id,
              phoneNumber:
                existingUser.phoneNumber,
            });

          const refreshToken =
            randomUUID();

          const expiresAt =
            new Date();

          expiresAt.setDate(
            expiresAt.getDate() + 30,
          );

          await this.prismaService.session.create({
            data: {
              userId: existingUser.id,
              refreshToken,
              expiresAt,
            },
          });

          return {
            accessToken,
            refreshToken,
            requiresPhoneVerification: false,
            user: {
              id: existingUser.id,
              phoneNumber:
                existingUser.phoneNumber,
              email:
                existingUser.email,
              authProvider:
                existingUser.authProvider,
            },
          };
        }
      }

      /**
       * GOOGLE / APPLE FLOW
       * Require phone verification first
       */
      if (!isPhoneProvider) {
        return {
          requiresPhoneVerification: true,

          user: {
            email,

            authProvider,
          },
        };
      }

      /**
       * PHONE OTP FLOW
       * Fully trusted account
       */
      let user = await this.prismaService.user.findUnique({
        where: {
          phoneNumber: phoneNumber!,
        },
      });

      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            phoneNumber,

            email,

            authProvider,

            phoneVerified: true,
          },
        });
      }

      const accessToken =
        await this.jwtService.signAsync({
          sub: user.id,

          phoneNumber: user.phoneNumber,
        });

      const refreshToken = randomUUID();

      const expiresAt = new Date();

      expiresAt.setDate(expiresAt.getDate() + 30);

      await this.prismaService.session.create({
        data: {
          userId: user.id,

          refreshToken,

          expiresAt,
        },
      });

      return {
        accessToken,

        refreshToken,

        requiresPhoneVerification: false,

        user: {
          id: user.id,

          phoneNumber: user.phoneNumber,

          email: user.email,

          authProvider: user.authProvider,
        },
      };
    } catch (error) {
      console.error(error);

      throw new UnauthorizedException(
        'Invalid Firebase Token',
      );
    }
  }

  async completePhoneVerification(
    dto: CompletePhoneVerificationDto,
  ): Promise<AuthResponseType> {
    try {
      /**
       * Verify Google token
       */
      const googleToken =
        await this.firebaseService.verifyIdToken(
          dto.googleIdToken,
        );

      /**
       * Verify Phone token
       */
      const phoneToken =
        await this.firebaseService.verifyIdToken(
          dto.phoneIdToken,
        );

      const email =
        googleToken.email ?? null;

      const phoneNumber =
        phoneToken.phone_number ?? null;

      if (!phoneNumber) {
        throw new UnauthorizedException(
          'Phone number verification failed',
        );
      }

      /**
       * Check if phone account already exists
       */
      let user =
        await this.prismaService.user.findUnique({
          where: {
            phoneNumber,
          },
        });

      /**
       * Existing account found
       */
      if (user) {
        /**
         * Link Google email if missing
         */
        if (!user.email && email) {
          user = await this.prismaService.user.update({
            where: {
              id: user.id,
            },

            data: {
              email,

              authProvider: 'GOOGLE',
            },
          });
        }
      } else {
        /**
         * Create fully trusted account
         */
        user = await this.prismaService.user.create({
          data: {
            phoneNumber,

            email,

            authProvider: 'GOOGLE',

            phoneVerified: true,
          },
        });
      }

      /**
       * Generate JWT
       */
      const accessToken =
        await this.jwtService.signAsync({
          sub: user.id,

          phoneNumber: user.phoneNumber,
        });

      /**
       * Generate Refresh Token
       */
      const refreshToken = randomUUID();

      const expiresAt = new Date();

      expiresAt.setDate(expiresAt.getDate() + 30);

      /**
       * Persist Session
       */
      await this.prismaService.session.create({
        data: {
          userId: user.id,

          refreshToken,

          expiresAt,
        },
      });

      return {
        accessToken,

        refreshToken,

        requiresPhoneVerification: false,

        user: {
          id: user.id,

          phoneNumber: user.phoneNumber,

          email: user.email,

          authProvider: user.authProvider,
        },
      };
    } catch (error) {
      console.error(error);

      throw new UnauthorizedException(
        'Phone verification completion failed',
      );
    }
  }

  async getCurrentUser(userId: string) {
  const user =
    await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
        onboardingProgress: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    return user;
  }
}

