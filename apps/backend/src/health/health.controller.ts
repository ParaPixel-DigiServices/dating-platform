import { Controller, Get } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async healthCheck() {
    const userCount = await this.prismaService.user.count();

    return {
      status: 'ok',
      service: 'dating-platform-backend',
      database: 'connected',
      users: userCount,
    };
  }
}