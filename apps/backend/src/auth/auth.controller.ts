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
    console.log('Received Firebase login request with DTO:', dto);
    return this.authService.loginWithFirebase(dto);
  }

  @Post('complete-phone-verification')
  async completePhoneVerification(
    @Body()
    dto: CompletePhoneVerificationDto,
  ) {
    console.log('Received complete phone verification request with DTO:', dto);
    return this.authService.completePhoneVerification(
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Req() req: any,
  ) {
    return this.authService.getCurrentUser(
      req.user.sub,
    );
  }
}