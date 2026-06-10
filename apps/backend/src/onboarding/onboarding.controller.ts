import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { OnboardingService } from './onboarding.service';

import { OnboardingDetailsDto } from './dto/onboarding-details.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('details')
  async saveDetails(
    @Req() req: any,
    @Body() dto: OnboardingDetailsDto,
  ) {
    return this.onboardingService.saveDetails(
      req.user.sub,
      dto,
    );
  }
}