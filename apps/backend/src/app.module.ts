import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnv } from './config/validate-env';
import { AppConfigurationModule } from './config/config.module';
import { AppLoggerModule } from './common/logger/logger.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfigService } from './config/config.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { userInfo } from 'os';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './common/database/database.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    FirebaseModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
      validate: validateEnv,
    }),
    AppConfigurationModule,
    AppLoggerModule,

    ThrottlerModule.forRootAsync({
      inject: [AppConfigService],

      useFactory: (config: AppConfigService) => ({
        throttlers: [
          {
            ttl: config.throttleTTL*1000,
            limit: config.throttleLimit,
          },
        ],
      }),
    }),

    HealthModule,

    AuthModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
