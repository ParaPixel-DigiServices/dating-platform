import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CategoryType } from '@prisma/client';

export class SaveCategoryDto {
  @IsEnum(CategoryType)
  category!: CategoryType;

  // Required when category = MARRIAGE, ignored for LOVE
  @ValidateIf((o) => o.category === CategoryType.MARRIAGE)
  @IsString()
  @IsIn(['hindu', 'muslim', 'christian', 'sikh', 'buddhist', 'jain', 'others'])
  subCategory?: string;
}
