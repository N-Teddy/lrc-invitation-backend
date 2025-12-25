import { ChildGroup } from '../../common/enums/activity.enum';
import { UserResponseDto } from './user.dto';
export declare class GuardianResponseDto {
    fullName: string;
    phoneE164: string;
    relationship: string;
    email?: string;
}
export declare class ChildResponseDto extends UserResponseDto {
    group?: ChildGroup;
    guardians?: GuardianResponseDto[];
}
export declare class BulkCreateChildrenResponseDto {
    created: ChildResponseDto[];
    errors: Array<{
        index: number;
        message: string;
    }>;
}
export declare class ChildrenListResponseDto {
    items: ChildResponseDto[];
    page: number;
    limit: number;
    total: number;
    missingProfileImageCount: number;
}
