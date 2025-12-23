import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceRoleAtTime, ClassificationLabel } from '../../common/enums/attendance.enum';
import { ChildGroup, Town } from '../../common/enums/activity.enum';

export class AttendanceEntryResponseDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    present: boolean;

    @ApiProperty({ enum: AttendanceRoleAtTime })
    roleAtTime: AttendanceRoleAtTime;

    @ApiPropertyOptional({ enum: Town })
    originTownAtTime?: Town;

    @ApiPropertyOptional({ enum: ChildGroup })
    groupAtTime?: ChildGroup;

    @ApiPropertyOptional({ enum: ClassificationLabel })
    classificationLabel?: ClassificationLabel;
}

export class AttendanceResponseDto {
    @ApiPropertyOptional()
    id?: string;

    @ApiProperty()
    activityId: string;

    @ApiPropertyOptional()
    takenByUserId?: string;

    @ApiPropertyOptional()
    takenAt?: Date;

    @ApiProperty({ type: [AttendanceEntryResponseDto] })
    entries: AttendanceEntryResponseDto[];

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    updatedAt?: Date;
}
