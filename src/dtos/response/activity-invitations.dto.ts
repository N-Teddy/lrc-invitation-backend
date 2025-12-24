import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChildGroup } from '../../common/enums/activity.enum';

export class InvitedChildCardDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    fullName: string;

    @ApiPropertyOptional({ enum: ChildGroup })
    group?: ChildGroup;

    @ApiPropertyOptional()
    profileImageUrl?: string;
}

export class ActivityInvitedChildrenResponseDto {
    @ApiProperty()
    activityId: string;

    @ApiPropertyOptional({ enum: ChildGroup, isArray: true })
    targetGroups?: ChildGroup[];

    @ApiProperty({ type: [InvitedChildCardDto] })
    invited: InvitedChildCardDto[];
}

export class ActivityEligibleChildrenResponseDto {
    @ApiProperty()
    activityId: string;

    @ApiProperty()
    query: string;

    @ApiPropertyOptional({ enum: ChildGroup, isArray: true })
    targetGroups?: ChildGroup[];

    @ApiProperty({ type: [InvitedChildCardDto] })
    results: InvitedChildCardDto[];
}
