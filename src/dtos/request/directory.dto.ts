import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';

export class MonitorDirectoryQueryDto {
    @ApiPropertyOptional({ description: 'Name search (min 2 chars recommended)' })
    @IsString()
    @IsOptional()
    q?: string;

    @ApiPropertyOptional({
        description: 'Resolve specific monitor IDs (repeat param or comma-separated)',
        type: [String],
    })
    @Transform(({ value }) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            return value
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean);
        }
        return undefined;
    })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    ids?: string[];

    @ApiPropertyOptional({ default: 20, maximum: 50 })
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    limit?: number;
}
