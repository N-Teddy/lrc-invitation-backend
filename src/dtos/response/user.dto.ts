import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LifecycleStatus, MonitorLevel, UserRole } from '../../common/enums/user.enum';
import { Town } from '../../common/enums/activity.enum';

export class UserResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    fullName: string;

    @ApiProperty({ enum: UserRole })
    role: UserRole;

    @ApiPropertyOptional({ enum: MonitorLevel })
    monitorLevel?: MonitorLevel;

    @ApiPropertyOptional()
    dateOfBirth?: Date;

    @ApiPropertyOptional({ enum: Town })
    originTown?: Town;

    @ApiPropertyOptional()
    preferredLanguage?: string;

    @ApiPropertyOptional()
    lifecycleStatus?: LifecycleStatus;

    @ApiPropertyOptional()
    archivedReason?: string;
}
