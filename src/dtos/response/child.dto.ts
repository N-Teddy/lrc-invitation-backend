import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChildGroup } from '../../common/enums/activity.enum';
import { UserResponseDto } from './user.dto';

export class ChildResponseDto extends UserResponseDto {
    @ApiPropertyOptional({ enum: ChildGroup })
    group?: ChildGroup;
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
