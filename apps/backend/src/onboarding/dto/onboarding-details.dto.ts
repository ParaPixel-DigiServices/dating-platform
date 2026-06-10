import {
  IsDateString,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';

import { Gender } from '@prisma/client';

export class OnboardingDetailsDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(Gender)
  gender!: Gender;
}