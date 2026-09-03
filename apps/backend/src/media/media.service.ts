import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    // Only initialize S3 client if variables exist (to prevent crash without .env)
    if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    } else {
      this.logger.warn('AWS S3 environment variables are missing! S3 uploads will fail.');
    }
  }

  async getPresignedUrl(userId: string, fileExtension: string) {
    if (!this.s3Client || !this.bucketName) {
      throw new InternalServerErrorException('S3 is not configured');
    }

    const fileKey = `profiles/${userId}/${uuidv4()}.${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });

    // Determine the base URL for fetching the image later
    // If CDN_BASE_URL is configured, use that instead of the raw S3 URL.
    const baseUrl = process.env.CDN_BASE_URL 
      ? process.env.CDN_BASE_URL 
      : `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com`;

    return {
      uploadUrl: url,
      fileKey,
      publicUrl: `${baseUrl}/${fileKey}`,
    };
  }
}
