import { ApiProperty } from '@nestjs/swagger';
import { ChildGroup } from '../../common/enums/activity.enum';

export class AgeBandDto {
    @ApiProperty({ enum: ChildGroup })
    group: ChildGroup;

    @ApiProperty()
    minAgeYears: number;

    @ApiProperty()
    maxAgeYears: number;
}

export class AgeToGroupMappingResponseDto {
    @ApiProperty({ type: [AgeBandDto] })
    bands: AgeBandDto[];
}

export class GroupRecomputeResultDto {
    @ApiProperty()
    processedChildren: number;

    @ApiProperty()
    updatedGroups: number;

    @ApiProperty()
    archivedAdults: number;

    @ApiProperty()
    remindersCreated: number;
}
