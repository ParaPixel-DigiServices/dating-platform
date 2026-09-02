import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [SocialService],
  controllers: [SocialController]
})
export class SocialModule {}
