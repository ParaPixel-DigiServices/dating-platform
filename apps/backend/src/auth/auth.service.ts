import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppConfigService } from '../config/config.service';
import { DatabaseService } from '../common/database/database.service';
import { FirebaseService } from '../common/firebase/firebase.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { DevicePlatform } from '../common/enums/device-platform.enum';
import { createHash } from 'node:crypto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
    private readonly database: DatabaseService,
    private readonly firebase: FirebaseService,
  ) {}

  private async generateAccessToken(
    payload: JwtPayload,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
        secret: this.config.jwtAccessSecret,
        expiresIn: '15m',
    });
  }

  private async generateRefreshToken(
    payload: JwtPayload,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
        secret: this.config.jwtRefreshSecret,
        expiresIn: '30d',
    });
  }

  async firebaseLogin(
    idToken: string,
    device: {
        deviceId: string;
        platform: DevicePlatform;
        deviceName?: string;
    },
    ) {
    // 1. Verify Firebase identity
        const firebaseUser = await this.firebase.verifyIdToken(idToken);

        // 2. Find or create user
        const user = await this.findOrCreateUser(firebaseUser);

        // 3. Find or create device
        const userDevice = await this.findOrCreateDevice(
            user.id,
            device,
        );

        // 4. Generate session ID
        const sessionId = uuid();

        // 5. Create JWT payload
        const payload: JwtPayload = {
            sub: user.id,
            sessionId,
            role: user.role,
        };

        // 6. Generate tokens
        const accessToken = await this.generateAccessToken(
            payload,
        );

        const refreshToken = await this.generateRefreshToken(
            payload,
        );

        // 7. Persist session
        await this.createSession(
            sessionId,
            user.id,
            userDevice.id,
            refreshToken,
        );

        // 8. Return auth response
        return {
            accessToken,
            refreshToken,

            user: {
            id: user.id,
            phoneNumber: user.phoneNumber,
            email: user.email,
            role: user.role,
            status: user.status,
            },
        };
    }

  private async findOrCreateUser(
    firebaseUser: {
        uid: string,
        phoneNumber: string | null,
        email: string | null,
    },
  ){
    const existingUser = await this.database.user.findUnique({
        where: {
            firebaseUid: firebaseUser.uid,
        },
    });

    if(existingUser){
        return existingUser;
    }

    return this.database.user.create({
        data: {
            firebaseUid: firebaseUser.uid,
            phoneNumber: firebaseUser.phoneNumber,
            email: firebaseUser.email,
        },
    });
  }

  private async findOrCreateDevice(
    userId: string,
    device: {
        deviceId: string;
        platform: DevicePlatform;
        deviceName?: string;
    },
  ) {
    const existingDevice = await this.database.device.findUnique({
        where: {
            userId_clientDeviceId: {
                userId,
                clientDeviceId: device.deviceId,
            },
        },
    });

    if(existingDevice){
        return this.database.device.update({
            where: {
                id: existingDevice.id,
            },
            data: {
                deviceName: device.deviceName,
                platform: device.platform,
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

  private hashtoken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createSession(
    sessionId: string,
    userId: string,
    deviceId: string,
    refreshToken: string,
  ){
    return this.database.session.create({
        data: {
            id: sessionId,
            userId,
            deviceId,
            refreshTokenHash: this.hashtoken(refreshToken),
            expiresAt: new Date(Date.now()+30*24*60*60*1000),
            lastUsedAt: new Date(),
        },
    });
  }
}

