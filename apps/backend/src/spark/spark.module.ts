import { Module } from '@nestjs/common';
import { SparkService } from './spark.service';
import { SparkController } from './spark.controller';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SparkController],
  providers: [SparkService],
})
export class SparkModule {}
