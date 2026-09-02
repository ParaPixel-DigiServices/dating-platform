import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('media')
@UseGuards(AuthGuard('jwt'))
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('presigned-url')
  async getPresignedUrl(
    @Req() req: any,
    @Query('extension') extension: string = 'jpg'
  ) {
    const userId = req.user.userId;
    return this.mediaService.getPresignedUrl(userId, extension);
  }
}
