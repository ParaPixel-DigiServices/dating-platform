import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService, private readonly redisService: RedisService) {}

  @Get()
  async healthCheck() {
    const userCount = await this.prismaService.user.count();
    const redisPing = await this.redisService.client.ping();

    return {
      status: 'ok',
      service: 'dating-platform-backend',
      database: 'connected',
      users: userCount,
      redis: redisPing,
    };
  }
}