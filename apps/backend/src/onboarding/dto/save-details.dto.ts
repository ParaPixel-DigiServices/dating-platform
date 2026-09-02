import { IsDateString, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Frontend sends "Man" → "MALE", "Woman" → "FEMALE", "Other" → "NON-BINARY"
// Backend maps NON-BINARY → Gender.OTHER
export enum FrontendGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON-BINARY',
}

export class SaveDetailsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(FrontendGender)
  gender!: FrontendGender;
}
