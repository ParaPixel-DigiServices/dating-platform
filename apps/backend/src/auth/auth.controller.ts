import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { FirebaseLoginDto } from './dto/firebase-login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { CompletePhoneVerificationDto } from './dto/complete-phone-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('firebase-login')
  async firebaseLogin(
    @Body() dto: FirebaseLoginDto,
  ) {
    return this.authService.loginWithFirebase(dto);
  }

  @Post('complete-phone-verification')
  async completePhoneVerification(
    @Body()
    dto: CompletePhoneVerificationDto,
  ) {
    return this.authService.completePhoneVerification(
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    return {
      user: req.user,
    };
  }
}