import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { CloudinaryService } from '../common/third-party/cloudinary.service';
import { AppConfigService } from '../config/app-config.service';

@Module({
    providers: [MediaService, CloudinaryService, AppConfigService],
    exports: [MediaService],
})
export class MediaModule {}
