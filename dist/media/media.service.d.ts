import { AppConfigService } from '../config/app-config.service';
import { CloudinaryService } from '../common/third-party/cloudinary.service';
import { UploadedFile } from '../common/interfaces/uploaded-file.interface';
import { SettingsService } from '../settings/settings.service';
export declare class MediaService {
    private readonly config;
    private readonly cloudinaryService;
    private readonly settingsService;
    constructor(config: AppConfigService, cloudinaryService: CloudinaryService, settingsService: SettingsService);
    uploadProfileImage(file: UploadedFile): Promise<{
        url: any;
        provider: string;
        publicId: any;
        mimeType: string;
        sizeBytes: number;
        updatedAt: Date;
    } | {
        url: string;
        provider: string;
        mimeType: string;
        sizeBytes: number;
        updatedAt: Date;
    }>;
    private saveLocal;
    private getExtension;
}
