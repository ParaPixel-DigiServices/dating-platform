import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { SaveDetailsDto } from './dto/save-details.dto';
import { SaveCategoryDto } from './dto/save-category.dto';

interface JwtRequest extends Request {
  user: { userId: string; sessionId: string; role: string };
}

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * POST /onboarding/details
   * Save name, DOB, gender. Creates Profile row for the user.
   * Body: { firstName, lastName, dateOfBirth, gender }
   */
  @Post('details')
  @HttpCode(HttpStatus.OK)
  saveDetails(@Req() req: JwtRequest, @Body() dto: SaveDetailsDto) {
    return this.onboardingService.saveDetails(req.user.userId, dto);
  }

  /**
   * POST /onboarding/category
   * Set category (LOVE | MARRIAGE) + optional religion sub-category.
   * Body: { category, subCategory? }
   */
  @Post('category')
  @HttpCode(HttpStatus.OK)
  saveCategory(@Req() req: JwtRequest, @Body() dto: SaveCategoryDto) {
    return this.onboardingService.saveCategory(req.user.userId, dto);
  }

  /**
   * POST /onboarding/marriage-details
   * Save general details for marriage track
   */
  @Post('marriage-details')
  @HttpCode(HttpStatus.OK)
  saveMarriageDetails(@Req() req: JwtRequest, @Body() dto: any) {
    return this.onboardingService.saveMarriageDetails(req.user.userId, dto);
  }
}
