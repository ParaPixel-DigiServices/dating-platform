import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DeckService } from './deck.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    sessionId: string;
    role: string;
  };
}

@Controller('deck')
@UseGuards(JwtAuthGuard)
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Get()
  async getDeck(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const profiles = await this.deckService.getDeck(userId);
    return { success: true, data: profiles };
  }
}
