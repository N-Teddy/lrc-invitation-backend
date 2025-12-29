import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Town } from '../../common/enums/activity.enum';

class BirthdayProfileImageResponseDto {
    @ApiPropertyOptional()
    url?: string;
}

export class BirthdayPersonResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    fullName: string;

    @ApiPropertyOptional({ enum: Town })
    originTown?: Town;

    @ApiPropertyOptional({ type: BirthdayProfileImageResponseDto })
    profileImage?: BirthdayProfileImageResponseDto;
}

export class BirthdayTodayResponseDto {
    @ApiProperty({ type: [BirthdayPersonResponseDto] })
    items: BirthdayPersonResponseDto[];
}
