export interface MediaStorageSettings {
    providerHint?: 'local' | 'cloudinary';
    maxSizeBytes?: number;
    allowedMimeTypes?: string[];
}
