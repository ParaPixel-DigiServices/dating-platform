import { IsNotEmpty, IsString } from 'class-validator';

export class CompletePhoneVerificationDto {
  @IsString()
  @IsNotEmpty()
  googleIdToken!: string;

  @IsString()
  @IsNotEmpty()
  phoneIdToken!: string;
}