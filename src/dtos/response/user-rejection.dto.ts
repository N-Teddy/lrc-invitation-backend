import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.dto';

export class RejectUserResponseDto {
    @ApiProperty()
    rejected: boolean;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}
