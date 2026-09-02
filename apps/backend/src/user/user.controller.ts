import { Controller, Get, Patch, Post, Put, Delete, Body, UseGuards, Req, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    sessionId: string;
    role: string;
  };
}

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const user = await this.userService.getMe(userId);
    return { success: true, data: user };
  }

  @Get('profile/:id')
  async getPublicProfile(@Req() req: RequestWithUser, @Param('id') profileId: string) {
    const profile = await this.userService.getPublicProfile(profileId);
    return { success: true, data: profile };
  }

  @Get('onboarding-fields')
  async getOnboardingFields(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const fields = await this.userService.getOnboardingFields(userId);
    return { success: true, data: fields };
  }

  @Get('religions')
  async getReligions() {
    const religions = await this.userService.getReligions();
    return { success: true, data: religions };
  }

  @Get('interests')
  async getInterests(@Query('category') category?: string) {
    const interests = await this.userService.getInterests(category);
    return { success: true, data: interests };
  }

  @Patch('me')
  async updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    const userId = req.user.userId;
    const updatedUser = await this.userService.updateProfile(userId, dto);
    return { success: true, data: updatedUser };
  }

  @Put('preferences')
  async updatePreferences(@Req() req: RequestWithUser, @Body() dto: UpdatePreferenceDto) {
    const userId = req.user.userId;
    const preferences = await this.userService.upsertPreference(userId, dto);
    return { success: true, data: preferences };
  }
  @Get('wallet')
  async getWallet(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const wallet = await this.userService.getWallet(userId);
    return { success: true, data: wallet };
  }

  @Post('wallet/earn')
  async earnCoins(@Req() req: RequestWithUser, @Body() dto: { amount: number, description: string }) {
    const userId = req.user.userId;
    const wallet = await this.userService.earnCoins(userId, dto.amount, dto.description);
    return { success: true, data: wallet };
  }

  @Post('photos')
  async addPhoto(@Req() req: RequestWithUser, @Body() dto: { cdnUrl: string; storageKey: string }) {
    const userId = req.user.userId;
    const photo = await this.userService.addPhoto(userId, dto.cdnUrl, dto.storageKey);
    return { success: true, data: photo };
  }

  @Delete('photos/:id')
  async deletePhoto(@Req() req: RequestWithUser, @Param('id') photoId: string) {
    const userId = req.user.userId;
    const result = await this.userService.deletePhoto(userId, photoId);
    return { success: true, data: result };
  }

  @Put('photos/reorder')
  async reorderPhotos(@Req() req: RequestWithUser, @Body() dto: { photoIds: string[] }) {
    const userId = req.user.userId;
    const result = await this.userService.reorderPhotos(userId, dto.photoIds);
    return { success: true, data: result };
  }

  @Patch('photos/:id/primary')
  async setPrimaryPhoto(@Req() req: RequestWithUser, @Param('id') photoId: string) {
    const userId = req.user.userId;
    const result = await this.userService.setPrimaryPhoto(userId, photoId);
    return { success: true, data: result };
  }

  @Get('questions')
  async getQuestions(@Query('category') category: string) {
    const questions = await this.userService.getQuestions(category);
    return { success: true, data: questions };
  }

  @Post('answers')
  async submitAnswers(@Req() req: RequestWithUser, @Body() dto: { answers: { questionId: string, answer: string }[] }) {
    const userId = req.user.userId;
    const result = await this.userService.submitAnswers(userId, dto.answers);
    return { success: true, data: result };
  }

  @Delete('account')
  async deleteAccount(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const result = await this.userService.deleteAccount(userId);
    return result;
  }
}
