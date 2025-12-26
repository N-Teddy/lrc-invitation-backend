import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChildGroup } from '../../common/enums/activity.enum';
import { UserResponseDto } from './user.dto';

export class GuardianResponseDto {
    @ApiProperty()
    fullName: string;

    @ApiProperty()
    phoneE164: string;

    @ApiProperty()
    relationship: string;

    @ApiPropertyOptional()
    email?: string;
}

export class ChildResponseDto extends UserResponseDto {
    @ApiPropertyOptional({ enum: ChildGroup })
    group?: ChildGroup;

    @ApiPropertyOptional({ type: [GuardianResponseDto] })
    guardians?: GuardianResponseDto[];
}

export class BulkCreateChildrenResponseDto {
    @ApiProperty({ type: [ChildResponseDto] })
    created: ChildResponseDto[];

    @ApiProperty({
        type: [Object],
        description: 'Per-item validation failures; successful items are still created.',
    })
    errors: Array<{ index: number; message: string }>;
}

export class ChildrenListResponseDto {
    @ApiProperty({ type: [ChildResponseDto] })
    items: ChildResponseDto[];

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ description: 'Count of children in scope missing profile image.' })
    missingProfileImageCount: number;
}

export class ChildGroupCountDto {
    @ApiProperty({ enum: ChildGroup })
    group: ChildGroup;

    @ApiProperty()
    count: number;
}

export class ChildrenGroupCountsResponseDto {
    @ApiProperty()
    total: number;

    @ApiProperty({ type: [ChildGroupCountDto] })
    counts: ChildGroupCountDto[];

    @ApiProperty({ description: 'Children missing a computed/stored group.' })
    unknownCount: number;
}
