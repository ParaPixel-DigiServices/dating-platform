import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    sessionId: string;
    role: string;
  };
}

@Controller('interaction')
@UseGuards(JwtAuthGuard)
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @Get('me/activity')
  async getActivity(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const data = await this.interactionService.getActivitySummary(userId);
    return { success: true, data };
  }

  @Post('swipe')
  async swipe(
    @Req() req: RequestWithUser,
    @Body() dto: { targetProfileId: string; type: 'LIKE' | 'PASS' | 'SUPER_LIKE' }
  ) {
    const userId = req.user.userId;
    const result = await this.interactionService.swipe(userId, dto.targetProfileId, dto.type);
    return { success: true, data: result };
  }
}
