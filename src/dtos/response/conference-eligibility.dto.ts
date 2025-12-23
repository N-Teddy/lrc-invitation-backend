import { ApiProperty } from '@nestjs/swagger';

export class FlaggedConferenceChildDto {
    @ApiProperty()
    userId: string;

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
