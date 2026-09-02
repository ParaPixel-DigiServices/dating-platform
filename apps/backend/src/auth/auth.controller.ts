import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseLoginDto } from './dto/firebase-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface JwtRequest extends Request {
  user: { userId: string; sessionId: string; role: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/firebase-login
   * Exchange Google + Phone Firebase tokens for backend JWTs.
   * Works for both sign-up and login — the backend determines which it is.
   */
  @Post('firebase-login')
  @HttpCode(HttpStatus.OK)
  async firebaseLogin(@Body() body: FirebaseLoginDto) {
    console.log("body", body);
    console.log("we got the request");
    try {
      return await this.authService.firebaseLogin(
        body.googleIdToken,
        body.phoneIdToken,
        {
          deviceId: body.deviceId,
          platform: body.platform,
          deviceName: body.deviceName,
        },
      );
    } catch (error) {
      console.error("FIREBASE LOGIN ERROR:", error);
      throw error;
    }
  }

  /**
   * GET /auth/me
   * Returns current user + onboardingStep. Called on every app launch.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: JwtRequest) {
    return this.authService.getMe(req.user.userId);
  }

  /**
   * POST /auth/refresh
   * Rotate access + refresh tokens. Old refresh token is invalidated.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  /**
   * POST /auth/logout
   * Revoke the current session. Frontend clears local state.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: JwtRequest) {
    await this.authService.logout(req.user.sessionId);
    return { success: true };
  }
}