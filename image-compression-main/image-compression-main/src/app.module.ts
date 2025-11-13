import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageCompressionController } from './controllers/image-compression.controller';
import { ImageCompressionService } from './services/image-compression.service';

@Module({
  imports: [],
  controllers: [AppController, ImageCompressionController],
  providers: [AppService, ImageCompressionService],
})
export class AppModule {}
