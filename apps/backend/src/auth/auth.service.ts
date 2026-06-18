import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import {
  AuthProvider,
  Prisma,
} from '@prisma/client';

import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

import { FirebaseService } from '../firebase/firebase.service';

import { FirebaseLoginDto } from './dto/firebase-login.dto';

import { CompletePhoneVerificationDto } from './dto/complete-phone-verification.dto';

import { AuthResponseType } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,

    private readonly jwtService: JwtService,

    private readonly firebaseService: FirebaseService,
  ) { }

  private async createAuthenticatedResponse(
    user: {
      id: string;

      phoneNumber: string | null;

      email: string | null;
    },
  ): Promise<AuthResponseType> {
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
      },
    };
  }

  private async findUserByAuthProvider(
    provider: AuthProvider,
    providerUserId: string,
  ) {
    const authProvider =
      await this.prismaService.userAuthProvider.findUnique({
        where: {
          provider_providerUserId: {
            provider,

            providerUserId,
          },
        },

        include: {
          user: true,
        },
      });

    return authProvider?.user ?? null;
  }

  private async ensureAuthProvider(
    prisma: Prisma.TransactionClient,
    userId: string,
    provider: AuthProvider,
    providerUserId: string,
  ) {
    const existingAuthProvider =
      await prisma.userAuthProvider.findUnique({
        where: {
          provider_providerUserId: {
            provider,

            providerUserId,
          },
        },
      });

    if (
      existingAuthProvider &&
      existingAuthProvider.userId !== userId
    ) {
      throw new UnauthorizedException(
        'Provider already linked to another account',
      );
    }

    if (!existingAuthProvider) {
      await prisma.userAuthProvider.create({
        data: {
          userId,

          provider,

          providerUserId,
        },
      });
    }
  }

  async loginWithFirebase(
    dto: FirebaseLoginDto,
  ): Promise<AuthResponseType> {
    try {
      const decodedToken =
        await this.firebaseService.verifyIdToken(
          dto.idToken,
        );

      const firebaseUid =
        decodedToken.uid;

      if (!firebaseUid) {
        throw new UnauthorizedException(
          'Invalid Firebase Token',
        );
      }

      const firebaseProvider =
        decodedToken.firebase.sign_in_provider;

      const email =
        decodedToken.email ?? null;

      if (firebaseProvider === 'phone') {
        const existingUser =
          await this.findUserByAuthProvider(
            AuthProvider.PHONE,
            firebaseUid,
          );

        if (existingUser) {
          return this.createAuthenticatedResponse(
            existingUser,
          );
        }

        throw new UnauthorizedException(
          'Account not found',
        );
      }

      if (
        firebaseProvider === 'google.com' ||
        firebaseProvider === 'apple.com'
      ) {
        const provider =
          firebaseProvider === 'google.com'
            ? AuthProvider.GOOGLE
            : AuthProvider.APPLE;

        const existingUser =
          await this.findUserByAuthProvider(
            provider,
            firebaseUid,
          );

        if (existingUser) {
          return this.createAuthenticatedResponse(
            existingUser,
          );
        }

        return {
          requiresPhoneVerification: true,

          user: {
            email,
          },
        };
      }

      return {
        requiresPhoneVerification: true,

        user: {
          email,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

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

      const googleUid =
        googleToken.uid;

      const phoneNumber =
        phoneToken.phone_number ?? null;

      const phoneUid =
        phoneToken.uid;

      if (!phoneNumber || !googleUid || !phoneUid) {
        throw new UnauthorizedException(
          'Phone number verification failed',
        );
      }

      const googleAuthProvider =
        await this.prismaService.userAuthProvider.findUnique({
          where: {
            provider_providerUserId: {
              provider: AuthProvider.GOOGLE,

              providerUserId: googleUid,
            },
          },

          include: {
            user: true,
          },
        });

      const phoneAuthProvider =
        await this.prismaService.userAuthProvider.findUnique({
          where: {
            provider_providerUserId: {
              provider: AuthProvider.PHONE,

              providerUserId: phoneUid,
            },
          },

          include: {
            user: true,
          },
        });

      if (
        googleAuthProvider?.user &&
        phoneAuthProvider?.user &&
        googleAuthProvider.user.id !== phoneAuthProvider.user.id
      ) {
        throw new UnauthorizedException(
          'Phone verification failed',
        );
      }

      let user =
        googleAuthProvider?.user ??
        phoneAuthProvider?.user ??
        null;

      if (user) {
        const currentUser = user;

        user = await this.prismaService.$transaction(
          async (prisma) => {
            const updatedUser =
              (!currentUser.email && email) ||
              (!currentUser.phoneNumber && phoneNumber) ||
              !currentUser.phoneVerified
                ? await prisma.user.update({
                    where: {
                      id: currentUser.id,
                    },

                    data: {
                      email: currentUser.email ?? email,

                      phoneNumber:
                        currentUser.phoneNumber ?? phoneNumber,

                      phoneVerified: true,
                    },
                  })
                : currentUser;

            await this.ensureAuthProvider(
              prisma,

              updatedUser.id,

              AuthProvider.GOOGLE,

              googleUid,
            );

            await this.ensureAuthProvider(
              prisma,

              updatedUser.id,

              AuthProvider.PHONE,

              phoneUid,
            );

            return updatedUser;
          },
        );
      } else {
        user = await this.prismaService.$transaction(
          async (tx) => {
            const createdUser =
              await tx.user.create({
                data: {
                  phoneNumber,

                  email,

                  phoneVerified: true,
                },
              });

            await tx.userAuthProvider.create({
              data: {
                userId: createdUser.id,

                provider: AuthProvider.GOOGLE,

                providerUserId: googleUid,
              },
            });

            await tx.userAuthProvider.create({
              data: {
                userId: createdUser.id,

                provider: AuthProvider.PHONE,

                providerUserId: phoneUid,
              },
            });

            return createdUser;
          },
        );
      }

      if (!user) {
        throw new UnauthorizedException(
          'Phone verification completion failed',
        );
      }

      return this.createAuthenticatedResponse(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

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
        authProviders: true,
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

