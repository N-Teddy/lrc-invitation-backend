import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceRoleAtTime, ClassificationLabel } from '../../common/enums/attendance.enum';
import { ChildGroup, Town } from '../../common/enums/activity.enum';

export class AttendanceEntryResponseDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    present: boolean;

    @ApiPropertyOptional({ description: 'Optional donation amount (FCFA).' })
    donationFcfa?: number;

    @ApiProperty({ enum: AttendanceRoleAtTime })
    roleAtTime: AttendanceRoleAtTime;

    @ApiPropertyOptional({ enum: Town })
    originTownAtTime?: Town;

    @ApiPropertyOptional({ enum: ChildGroup })
    groupAtTime?: ChildGroup;

    @ApiPropertyOptional({ enum: ClassificationLabel })
    classificationLabel?: ClassificationLabel;
}

export class ExternalAttendanceEntryResponseDto {
    @ApiProperty()
    externalId: string;

    @ApiProperty()
    fullName: string;

    @ApiProperty({ enum: ClassificationLabel })
    classificationLabel: ClassificationLabel;

    @ApiPropertyOptional({ description: 'Optional donation amount (FCFA).' })
    donationFcfa?: number;

    @ApiPropertyOptional({ enum: Town })
    scopeTown?: Town;
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

    @ApiPropertyOptional({ type: [ExternalAttendanceEntryResponseDto] })
    externalEntries?: ExternalAttendanceEntryResponseDto[];

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    updatedAt?: Date;
}
