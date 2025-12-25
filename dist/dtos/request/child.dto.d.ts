export declare class GuardianDto {
    fullName: string;
    phoneE164: string;
    relationship: string;
    email?: string;
}
export declare class CreateChildDto {
    fullName: string;
    dateOfBirth: string;
    guardians: GuardianDto[];
    preferredLanguage?: string;
    whatsAppPhoneE164?: string;
    whatsAppOptIn?: boolean;
}
export declare class CreateChildMultipartDto {
    fullName: string;
    dateOfBirth: string;
    guardiansJson: string;
    preferredLanguage?: string;
    whatsAppPhoneE164?: string;
    whatsAppOptIn?: boolean;
}
export declare class BulkCreateChildrenDto {
    children: CreateChildDto[];
}
