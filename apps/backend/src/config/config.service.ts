import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  ///////////////////////////////////////
  // Server
  ///////////////////////////////////////

  get environment(): string {
    return this.configService.getOrThrow(
      'server.env',
    );
  }

  get isDevelopment(): boolean {
    return this.environment === 'development';
  }

  get port(): number {
    return this.configService.getOrThrow(
      'server.port',
    );
  }


  ///////////////////////////////////////
  // Database
  ///////////////////////////////////////

  get databaseUrl(): string {
    return this.configService.getOrThrow(
      'database.url',
    );
  }


  ///////////////////////////////////////
  // Authentication
  ///////////////////////////////////////

  get jwtAccessSecret(): string {
    return this.configService.getOrThrow(
      'auth.jwt.accessSecret',
    );
  }

  get jwtRefreshSecret(): string {
    return this.configService.getOrThrow(
      'auth.jwt.refreshSecret',
    );
  }


  ///////////////////////////////////////
  // Firebase
  ///////////////////////////////////////

  get firebaseProjectId(): string {
    return this.configService.getOrThrow(
      'firebase.projectId',
    );
  }


  ///////////////////////////////////////
  // Security
  ///////////////////////////////////////

  get corsOrigin(): string {
    return this.configService.getOrThrow(
      'security.corsOrigin',
    );
  }

  get throttleTTL(): number {
    return this.configService.getOrThrow(
      'security.rateLimit.ttl',
    );
  }

  get throttleLimit(): number {
    return this.configService.getOrThrow(
      'security.rateLimit.limit',
    );
  }
}