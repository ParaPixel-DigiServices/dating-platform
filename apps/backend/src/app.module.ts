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
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './common/database/database.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { UserModule } from './user/user.module';
import { SparkModule } from './spark/spark.module';
import { InteractionModule } from './interaction/interaction.module';
import { SocialModule } from './social/social.module';
import { ChatModule } from './chat/chat.module';
import { DeckModule } from './deck/deck.module';
import { CallModule } from './call/call.module';
import { MediaModule } from './media/media.module';

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
    OnboardingModule,
    UserModule,
    SparkModule,
    InteractionModule,
    SocialModule,
    ChatModule,
    DeckModule,
    CallModule,
    MediaModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
