import { AppConfigService } from '../../config/app-config.service';
import { UploadedFile } from '../interfaces/uploaded-file.interface';
export declare class CloudinaryService {
    private readonly config;
    constructor(config: AppConfigService);
    uploadImage(file: UploadedFile): Promise<{
        url: any;
        provider: string;
        publicId: any;
        mimeType: string;
        sizeBytes: number;
        updatedAt: Date;
    }>;
}
