import { IsInt, IsArray, ArrayMinSize, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SetRecipientsDto {
    @ApiProperty({ example: [1, 2, 3], type: [Number] })
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    monitorIds: number[];

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    shouldReceiveWhatsapp?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    shouldReceiveEmail?: boolean;
}

class ActivityRecipientDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    activityId: number;

    @ApiProperty({ example: [1, 2, 3], type: [Number] })
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    monitorIds: number[];
}

export class BulkRecipientsDto {
    @ApiProperty({
        type: [ActivityRecipientDto],
        example: [
            { activityId: 1, monitorIds: [1, 2, 3] },
            { activityId: 2, monitorIds: [1, 4, 5] },
        ],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ActivityRecipientDto)
    activities: ActivityRecipientDto[];

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    shouldReceiveWhatsapp?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    shouldReceiveEmail?: boolean;
}
