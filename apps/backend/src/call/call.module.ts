import { Module } from '@nestjs/common';
import { CallService } from './call.service';
import { CallGateway } from './call.gateway';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CallService, CallGateway],
  exports: [CallService],
})
export class CallModule {}
