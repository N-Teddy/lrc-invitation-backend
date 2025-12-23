import { BadRequestException, Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { UploadedFile } from '../interfaces/uploaded-file.interface';

@Injectable()
export class CloudinaryService {
    constructor(private readonly config: AppConfigService) {}

    async uploadImage(file: UploadedFile) {
        const cloudName = this.config.cloudinaryCloudName;
        const apiKey = this.config.cloudinaryApiKey;
        const apiSecret = this.config.cloudinaryApiSecret;
        if (!cloudName || !apiKey || !apiSecret) {
            throw new BadRequestException('Cloudinary is not configured');
        }

        // Avoid a hard dependency until you enable it in production.
        let cloudinaryMod: any;
        try {
            cloudinaryMod = await import('cloudinary');
        } catch {
            throw new BadRequestException('Cloudinary dependency is not installed');
        }
        const cloudinary = cloudinaryMod.v2 ?? cloudinaryMod;
        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'lrc-jeuness/profile-images', resource_type: 'image' },
                (error: any, res: any) => {
                    if (error) return reject(error);
                    resolve(res);
                },
            );
            stream.end(file.buffer);
        });

        return {
            url: result.secure_url ?? result.url,
            provider: 'cloudinary',
            publicId: result.public_id,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            updatedAt: new Date(),
        };
    }
}
