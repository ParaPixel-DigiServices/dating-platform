import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { DevicePlatform } from '../../common/enums/device-platform.enum';

export class FirebaseLoginDto {
  /** Firebase ID token from Google Sign-In (verified by Firebase on the client) */
  @IsString()
  @IsNotEmpty()
  googleIdToken!: string;

  /** Firebase ID token from Phone OTP verification (optional for returning users) */
  @IsString()
  @IsOptional()
  phoneIdToken?: string;

  /** Optional — client device identifier. A UUID is generated server-side if omitted. */
  @IsString()
  @IsOptional()
  @MaxLength(255)
  deviceId?: string;

  @IsEnum(DevicePlatform)
  @IsOptional()
  platform?: DevicePlatform;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  deviceName?: string;
}