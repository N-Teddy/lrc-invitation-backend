import { UserResponseDto } from './user.dto';
export declare class ApproveUserResponseDto {
    approved: boolean;
    magicLinkSent: boolean;
    user: UserResponseDto;
}
