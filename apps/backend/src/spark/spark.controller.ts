import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SparkService } from './spark.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    sessionId: string;
    role: string;
  };
}

@Controller('spark')
@UseGuards(JwtAuthGuard)
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Get('me')
  async getMyQuestions(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const questions = await this.sparkService.getQuestions(userId);
    return { success: true, data: questions };
  }

  @Post('me/questions')
  async updateMyQuestions(
    @Req() req: RequestWithUser,
    @Body('questions') questions: string[]
  ) {
    const userId = req.user.userId;
    const result = await this.sparkService.upsertQuestions(userId, questions);
    return result;
  }
}
