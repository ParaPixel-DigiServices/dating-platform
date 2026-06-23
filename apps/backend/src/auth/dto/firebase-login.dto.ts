import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { DevicePlatform } 
from '../../common/enums/device-platform.enum';

export class FirebaseLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deviceId!: string;

  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  deviceName?: string;
}