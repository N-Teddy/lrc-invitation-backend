import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.dto';

export class UsersListResponseDto {
    @ApiProperty({ type: [UserResponseDto] })
    items: UserResponseDto[];

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    total: number;
}
