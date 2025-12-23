import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { AppConfigService } from '../config/app-config.service';
import { CloudinaryService } from '../common/third-party/cloudinary.service';
import { UploadedFile } from '../common/interfaces/uploaded-file.interface';

@Injectable()
export class MediaService {
    constructor(
        private readonly config: AppConfigService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async uploadProfileImage(file: UploadedFile) {
        if (!file.mimetype?.startsWith('image/')) {
            throw new BadRequestException('Invalid file type');
        }

        if (this.config.storageProvider === 'cloudinary') {
            return this.cloudinaryService.uploadImage(file);
        }
        return this.saveLocal(file);
    }

    private async saveLocal(file: UploadedFile) {
        const uploadsDir = join(process.cwd(), this.config.uploadsDir, 'profile-images');
        await mkdir(uploadsDir, { recursive: true });

        const extension = this.getExtension(file);
        const filename = `${randomUUID()}${extension}`;
        const filepath = join(uploadsDir, filename);
        await writeFile(filepath, file.buffer);

        const baseUrl = this.config.storageBaseUrl;
        return {
            url: `${baseUrl}/profile-images/${filename}`,
            provider: 'local',
            mimeType: file.mimetype,
            sizeBytes: file.size,
            updatedAt: new Date(),
        };
    }

    private getExtension(file: UploadedFile) {
        const fromName = extname(file.originalname ?? '');
        if (fromName) return fromName;
        const m = file.mimetype.split('/')[1] ?? 'jpg';
        return `.${m}`;
    }
}
