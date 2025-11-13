import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { OracleCloudEventDto } from '../dto/oracle-cloud-event.dto';
import { ImageCompressionService } from '../services/image-compression.service';

@Controller('image-compression')
export class ImageCompressionController {
  private readonly logger = new Logger(ImageCompressionController.name);

  constructor(
    private readonly imageCompressionService: ImageCompressionService,
  ) {}

  @Post('compress')
  @HttpCode(HttpStatus.OK)
  async compressImage(
    @Body() event: OracleCloudEventDto,
  ): Promise<{ message: string; status: string }> {
    try {
      this.logger.log(`Received Oracle Cloud event: ${event.eventID}`);
      this.logger.log(`Event type: ${event.eventType}`);
      this.logger.log(`Resource: ${event.data.resourceName}`);

      if (event.eventType !== 'com.oraclecloud.objectstorage.createobject') {
        this.logger.log(`Ignoring event type: ${event.eventType}`);
        return {
          message: 'Event type not supported for compression',
          status: 'ignored',
        };
      }

      const bucketName = event.data.additionalDetails.bucketName;
      const objectKey = event.data.resourceName;

      this.logger.log(
        `Processing compression for bucket: ${bucketName}, object: ${objectKey}`,
      );

      await this.imageCompressionService.compressImage(bucketName, objectKey);

      return {
        message: `Image ${objectKey} compressed successfully`,
        status: 'success',
      };
    } catch (error) {
      this.logger.error('Error processing compression request:', error);
      return {
        message: `Error compressing image: ${error.message}`,
        status: 'error',
      };
    }
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth(): { status: string; timestamp: string; service: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'image-compression',
    };
  }
}
