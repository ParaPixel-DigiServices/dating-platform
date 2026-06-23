import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { FirebaseLoginDto } from './dto/firebase-login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('firebase')
  async firebaseLogin(
    @Body() body: FirebaseLoginDto,
  ) {
    return this.authService.firebaseLogin(
        body.idToken,
        {
            deviceId: body.deviceId,
            platform: body.platform,
            deviceName: body.deviceName,
        },
    );
  }
}