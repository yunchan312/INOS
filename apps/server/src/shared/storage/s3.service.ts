import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      region: this.config.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 300 });
    const fileUrl = this.getPublicUrl(key);
    return { uploadUrl, fileUrl };
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}
