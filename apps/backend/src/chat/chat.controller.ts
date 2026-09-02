import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getInbox(@Request() req: any) {
    return this.chatService.getInbox(req.user.userId);
  }

  @Get(':matchId/messages')
  async getMessages(
    @Request() req: any,
    @Param('matchId') matchId: string,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(req.user.userId, matchId, before, limit ? parseInt(limit, 10) : 30);
  }
}
