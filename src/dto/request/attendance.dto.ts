import {
    IsInt,
    IsBoolean,
    IsOptional,
    IsString,
    IsArray,
    ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    childId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    activityId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    monitorId: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    present?: boolean;

    @ApiPropertyOptional({ example: 'Child was very engaged' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateAttendanceDto {
    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    present?: boolean;

    @ApiPropertyOptional({ example: 'Child was very engaged' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class BulkAttendanceDto {
    @ApiProperty({ example: [1, 2, 3, 4, 5], type: [Number] })
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    childIds: number[];

    @ApiProperty({ example: 1 })
    @IsInt()
    activityId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    monitorId: number;
}
