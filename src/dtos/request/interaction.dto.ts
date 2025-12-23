import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';
import { NotificationContextType } from '../../common/enums/notification.enum';

export class InteractionListQueryDto {
    @ApiPropertyOptional({ default: 50, maximum: 200 })
    @IsInt()
    @Min(1)
    @Max(200)
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ description: 'Pagination cursor (createdAt ms timestamp)' })
    @IsString()
    @IsOptional()
    cursor?: string;
}

export class InteractionContextParamsDto {
    @ApiPropertyOptional({ enum: NotificationContextType })
    @IsEnum(NotificationContextType)
    contextType: NotificationContextType;

    @ApiPropertyOptional()
    @IsMongoId()
    contextId: string;
}
