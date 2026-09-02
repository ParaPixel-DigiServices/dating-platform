import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SocialService } from './social.service';
import type { CreatePostDto, CreateCommentDto, VoteDto } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('topics')
  async getTopics() {
    return this.socialService.getTopics();
  }

  @Get('posts')
  async getPosts(
    @Request() req: any,
    @Query('topicId') topicId?: string,
    @Query('search') search?: string,
  ) {
    return this.socialService.getPosts(req.user.userId, topicId, search);
  }

  @Get('posts/:id')
  async getPostDetails(@Request() req: any, @Param('id') id: string) {
    return this.socialService.getPostDetails(req.user.userId, id);
  }

  @Post('posts')
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.socialService.createPost(req.user.userId, dto);
  }

  @Post('comments')
  async createComment(@Request() req: any, @Body() dto: CreateCommentDto) {
    return this.socialService.createComment(req.user.userId, dto);
  }

  @Post('vote')
  async vote(@Request() req: any, @Body() dto: VoteDto) {
    return this.socialService.vote(req.user.userId, dto);
  }
}
