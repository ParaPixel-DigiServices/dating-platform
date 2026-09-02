import { IsOptional, IsInt, Min, Max, IsNumber, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Transform } from 'class-transformer';
import { Gender, EducationLevel, DietPreference, SmokingHabit, DrinkingHabit } from '@prisma/client';

export class UpdatePreferenceDto {
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  minAge?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  maxAge?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(250)
  maxDistanceKm?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(Gender, { each: true })
  genderPreference?: Gender[];

  @IsOptional()
  @IsArray()
  @IsEnum(SmokingHabit, { each: true })
  smokingHabits?: SmokingHabit[];

  @IsOptional()
  @IsArray()
  @IsEnum(DrinkingHabit, { each: true })
  drinkingHabits?: DrinkingHabit[];

  @IsOptional()
  @IsArray()
  @IsEnum(DietPreference, { each: true })
  dietPreferences?: DietPreference[];

  // Soft preference weights
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  valuesWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  lifestyleWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  looksWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  careerWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  familyWeight?: number;
}
