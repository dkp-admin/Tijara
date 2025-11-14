import {
  GetObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import config from '../../configuration';

@Injectable()
export class ImageCompressionService {
  private readonly logger = new Logger(ImageCompressionService.name);
  private s3: S3Client;
  private readonly maxWidth: number;
  private readonly jpegQuality: number;
  private readonly webpQuality: number;

  constructor() {
    this.maxWidth = parseInt(process.env.MAX_IMAGE_WIDTH || '1920', 10);
    this.jpegQuality = parseInt(process.env.JPEG_QUALITY || '80', 10);
    this.webpQuality = parseInt(process.env.WEBP_QUALITY || '80', 10);

    this.logger.log(`Current environment: ${process.env.NODE_ENV || 'local'}`);
    this.logger.log(`Using config: ${config.name}`);
    this.logger.log(`S3 Host: ${config.s3.host}`);
    this.logger.log(`S3 Region: ${config.s3.region}`);
    this.logger.log(`Default Bucket: ${config.s3.defaultBucket}`);

    this.s3 = new S3Client({
      endpoint: `https://${config.s3.host}`,
      credentials: {
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      },
      region: config.s3.region,
      forcePathStyle: true,
    });

    this.logger.log(
      `Image compression settings: maxWidth=${this.maxWidth}, jpegQuality=${this.jpegQuality}, webpQuality=${this.webpQuality}`,
    );
  }

  async testConnection(): Promise<{
    success: boolean;
    buckets: string[];
    error?: string;
  }> {
    try {
      this.logger.log('Testing S3 connection and listing available buckets...');
      const listBucketsCommand = new ListBucketsCommand({});
      const response = await this.s3.send(listBucketsCommand);

      this.logger.log(`Successfully connected to Oracle Cloud Object Storage`);
      const bucketNames = response.Buckets?.map((b) => b.Name || '') || [];
      this.logger.log(`Available buckets: ${bucketNames.join(', ') || 'None'}`);
      this.logger.log(`Current config bucket: ${config.s3.defaultBucket}`);

      const bucketExists = response.Buckets?.some(
        (bucket) => bucket.Name === config.s3.defaultBucket,
      );
      if (!bucketExists) {
        this.logger.error(
          `ERROR: Configured bucket '${config.s3.defaultBucket}' does not exist!`,
        );
        this.logger.error(
          `Available buckets: ${bucketNames.join(', ') || 'None'}`,
        );
      } else {
        this.logger.log(
          `✓ Configured bucket '${config.s3.defaultBucket}' exists and is accessible`,
        );
      }

      return {
        success: true,
        buckets: bucketNames,
      };
    } catch (error) {
      this.logger.error('Failed to connect to S3 or list buckets:', error);
      return {
        success: false,
        buckets: [],
        error: error.message,
      };
    }
  }

  async compressImage(bucketName: string, objectKey: string): Promise<void> {
    try {
      await this.testConnection();
      this.logger.log(
        `Starting compression for ${objectKey} in bucket ${bucketName}`,
      );
      this.logger.log(`S3 endpoint: ${config.s3.host}`);
      this.logger.log(`S3 region: ${config.s3.region}`);

      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      this.logger.log(`Attempting to get object: ${bucketName}/${objectKey}`);
      const originalObject = await this.s3.send(getObjectCommand);

      if (!originalObject.Body) {
        throw new Error('No image data found');
      }

      const imageBuffer = Buffer.from(
        await originalObject.Body.transformToByteArray(),
      );

      this.logger.log(
        `Original image size : ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`,
      );

      if (!this.isImageFile(objectKey)) {
        this.logger.log(`Skipping non-image file: ${objectKey}`);
        return;
      }

      const compressedBuffer = await this.compressImageBuffer(imageBuffer);

      this.logger.log(
        `Compressed buffer length: ${compressedBuffer.length},${imageBuffer.length}`,
      );

      const putObjectCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: compressedBuffer,
        ContentType: originalObject.ContentType || 'image/jpeg',
        Metadata: {
          ...(originalObject.Metadata || {}),
          compressed: 'true',
          originalSize: imageBuffer.length.toString(),
          compressedSize: compressedBuffer.length.toString(),
        },
      });

      this.logger.log(
        `Attempting to overwrite object: ${bucketName}/${objectKey}`,
      );
      this.logger.log(`Object size: ${compressedBuffer.length} bytes`);

      await this.s3.send(putObjectCommand);

      this.logger.log(
        `Successfully compressed ${objectKey}. Original: ${imageBuffer.length} bytes, Compressed: ${compressedBuffer.length} bytes`,
      );
    } catch (error) {
      this.logger.error(`Error compressing image ${objectKey}:`, error);

      if (error.name === 'NoSuchBucket') {
        this.logger.error(
          `Bucket '${bucketName}' does not exist or is not accessible`,
        );
        this.logger.error(
          `Available buckets should be checked in Oracle Cloud Console`,
        );
        this.logger.error(`Current namespace: axcy4ryac3ty`);
      } else if (error.name === 'NoSuchKey') {
        this.logger.error(
          `Object '${objectKey}' does not exist in bucket '${bucketName}'`,
        );
      } else if (error.name === 'AccessDenied') {
        this.logger.error(
          `Access denied to bucket '${bucketName}' or object '${objectKey}'`,
        );
        this.logger.error(`Check credentials and bucket permissions`);
      }

      throw error;
    }
  }

  private async compressImageBuffer(buffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      this.logger.log(
        `Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${buffer.length} bytes`,
      );

      const compressedImage = image;

      this.logger.log(metadata.format, 'Image format');

      switch (metadata.format) {
        case 'jpeg':
          return await compressedImage
            .jpeg({ quality: 10, progressive: true })
            .toBuffer();
        case 'png':
          return await compressedImage.png({ compressionLevel: 9 }).toBuffer();
        case 'webp':
          return await compressedImage.webp({ quality: 10 }).toBuffer();
        case 'gif':
          return await compressedImage.gif().toBuffer();
        case 'tiff':
          return await compressedImage.tiff({ compression: 'lzw' }).toBuffer();
        default:
          this.logger.log(`Converting ${metadata.format} to JPEG`);
          return await compressedImage
            .jpeg({ quality: 10, progressive: true })
            .toBuffer();
      }
    } catch (error) {
      this.logger.error('Error during image compression:', error);
      throw error;
    }
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.bmp',
      '.webp',
      '.tiff',
    ];
    const extension = filename
      .toLowerCase()
      .substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }
}
