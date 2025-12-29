import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MonitorLevel } from '../../common/enums/user.enum';

export class MonitorLevelChangeDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiPropertyOptional({ enum: MonitorLevel })
    oldLevel?: MonitorLevel;

    @ApiProperty({ enum: MonitorLevel })
    newLevel: MonitorLevel;

    @ApiPropertyOptional()
    changedByUserId?: string;

    @ApiProperty()
    createdAt: Date;
}

export class MonitorLevelChangesResponseDto {
    @ApiProperty({ type: [MonitorLevelChangeDto] })
    items: MonitorLevelChangeDto[];
}
