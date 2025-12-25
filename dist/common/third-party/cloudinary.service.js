"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const app_config_service_1 = require("../../config/app-config.service");
let CloudinaryService = class CloudinaryService {
    constructor(config) {
        this.config = config;
    }
    async uploadImage(file) {
        const cloudName = this.config.cloudinaryCloudName;
        const apiKey = this.config.cloudinaryApiKey;
        const apiSecret = this.config.cloudinaryApiSecret;
        if (!cloudName || !apiKey || !apiSecret) {
            throw new common_1.BadRequestException('Cloudinary is not configured');
        }
        let cloudinaryMod;
        try {
            cloudinaryMod = await Promise.resolve().then(() => require('cloudinary'));
        }
        catch {
            throw new common_1.BadRequestException('Cloudinary dependency is not installed');
        }
        const cloudinary = cloudinaryMod.v2 ?? cloudinaryMod;
        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'lrc-jeuness/profile-images', resource_type: 'image' }, (error, res) => {
                if (error)
                    return reject(error);
                resolve(res);
            });
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
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map