import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsEnum, 
  IsBoolean,
  IsArray
} from 'class-validator';


export class UpdateProfileDto {
  // Base Profile Fields
  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsNumber()
  heightCm?: number;

  @IsOptional() @IsString()
  educationLevel?: string;

  @IsOptional() @IsString()
  occupation?: string;

  @IsOptional() @IsString()
  religionId?: string;

  @IsOptional() @IsString()
  casteId?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  interestIds?: string[];

  @IsOptional() @IsString()
  dietPreference?: string;

  @IsOptional() @IsString()
  smokingHabit?: string;

  @IsOptional() @IsString()
  drinkingHabit?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  state?: string;

  @IsOptional() @IsString()
  country?: string;

  @IsOptional() @IsString()
  marriageSubCategory?: string; // 'HINDU' | 'MUSLIM' | 'CHRISTIAN'

  // New Work Fields
  @IsOptional() @IsString() workSector?: string;
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() annualIncome?: string;

  @IsOptional() @IsString() maritalStatus?: string;
  @IsOptional() @IsString() relocationPreference?: string;
  @IsOptional() @IsString() disabilityStatus?: string;

  // New Family Fields (Marriage Profile)
  @IsOptional() @IsString() familyLivingStatus?: string;
  @IsOptional() @IsString() familyIncome?: string;
  @IsOptional() @IsString() fatherName?: string;
  @IsOptional() @IsString() motherName?: string;
  @IsOptional() @IsNumber() brotherCount?: number;
  @IsOptional() @IsNumber() sisterCount?: number;
}
