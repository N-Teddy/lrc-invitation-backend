import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceRoleAtTime, ClassificationLabel } from '../../common/enums/attendance.enum';
import { ActivityType, ChildGroup, TargetingCode, Town } from '../../common/enums/activity.enum';

const PARTICIPANT_ROLES = [...Object.values(AttendanceRoleAtTime), 'external'] as const;

export class AttendanceRosterParticipantDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    fullName: string;

    @ApiProperty({ enum: PARTICIPANT_ROLES })
    role: (typeof PARTICIPANT_ROLES)[number];

    @ApiPropertyOptional({ enum: ChildGroup })
    group?: ChildGroup;

    @ApiPropertyOptional()
    profileImageUrl?: string;

    @ApiPropertyOptional({ enum: ClassificationLabel })
    classificationLabel?: ClassificationLabel;

    @ApiPropertyOptional()
    present?: boolean;

    @ApiPropertyOptional({
        description: 'Optional donation amount (FCFA) recorded for this participant.',
    })
    donationFcfa?: number;
}

export class AttendanceRosterResponseDto {
    @ApiProperty()
    activityId: string;

    @ApiProperty({ enum: ActivityType })
    activityType: ActivityType;

    @ApiProperty({ enum: Town })
    activityTown: Town;

    @ApiProperty({ enum: TargetingCode })
    targetingCode: TargetingCode;

    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;

    @ApiPropertyOptional({
        enum: Town,
        description: 'Only set for conferences (per-town attendance).',
    })
    scopeTown?: Town;

    @ApiPropertyOptional()
    takenAt?: Date;

    @ApiProperty({ description: 'True when attendance cannot be changed anymore.' })
    locked: boolean;

    @ApiPropertyOptional()
    lockReason?: string;

    @ApiProperty({ type: [String], enum: ClassificationLabel })
    classificationLabels: ClassificationLabel[];

    @ApiProperty({ type: [AttendanceRosterParticipantDto] })
    participants: AttendanceRosterParticipantDto[];

    @ApiPropertyOptional({
        description: 'Convenience list of external entries already recorded for this activity.',
    })
    externalEntries?: Array<{
        externalId: string;
        fullName: string;
        classificationLabel: ClassificationLabel;
        donationFcfa?: number;
    }>;
}

export class AttendanceEligibleChildDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    fullName: string;

    @ApiPropertyOptional({ enum: ChildGroup })
    group?: ChildGroup;

    @ApiPropertyOptional()
    profileImageUrl?: string;
}

export class AttendanceEligibleChildrenResponseDto {
    @ApiProperty()
    activityId: string;

    @ApiProperty()
    query: string;

    @ApiPropertyOptional({ enum: Town })
    scopeTown?: Town;

    @ApiProperty({ type: [AttendanceEligibleChildDto] })
    results: AttendanceEligibleChildDto[];
}
