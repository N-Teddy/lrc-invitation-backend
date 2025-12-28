import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MonitorLevel } from '../../common/enums/user.enum';
import { Town } from '../../common/enums/activity.enum';

export class MonitorDirectoryResponseDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    fullName: string;

    @ApiPropertyOptional({ enum: Town })
    originTown?: Town;

    @ApiPropertyOptional({ enum: MonitorLevel })
    monitorLevel?: MonitorLevel;

    @ApiPropertyOptional()
    profileImageUrl?: string;

    @ApiPropertyOptional()
    dateOfBirth?: Date;
}
