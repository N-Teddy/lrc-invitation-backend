import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.dto';

export class ApproveUserResponseDto {
    @ApiProperty()
    approved: boolean;

    @ApiProperty()
    magicLinkSent: boolean;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}
