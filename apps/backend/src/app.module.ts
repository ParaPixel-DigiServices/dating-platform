import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseModule } from './firebase/firebase.module';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [HealthModule, PrismaModule, AuthModule, RedisModule, FirebaseModule, OnboardingModule],
  controllers: [AppController],
  providers: [AppService, FirebaseService],
})
export class AppModule {}
