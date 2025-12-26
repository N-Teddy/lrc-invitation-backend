import { ApiProperty } from '@nestjs/swagger';
import { ChildGroup } from '../../common/enums/activity.enum';

export class FlaggedConferenceChildDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    fullName: string;

    @ApiProperty({ required: false, enum: ChildGroup })
    group?: ChildGroup;

    @ApiProperty({ required: false })
    profileImageUrl?: string;

    @ApiProperty()
    reason: string;
}

export class ConferenceEligibilityResponseDto {
    @ApiProperty()
    activityId: string;

    @ApiProperty()
    windowStart: Date;

    @ApiProperty()
    windowEnd: Date;

    @ApiProperty()
    invitedCount: number;

    @ApiProperty()
    qualifiedCount: number;

    @ApiProperty()
    flaggedCount: number;

    @ApiProperty({ type: [FlaggedConferenceChildDto] })
    flaggedChildren: FlaggedConferenceChildDto[];
}
