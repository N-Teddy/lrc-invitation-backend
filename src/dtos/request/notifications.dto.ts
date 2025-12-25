import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
    Channel,
    NotificationContextType,
    NotificationStatus,
} from '../../common/enums/notification.enum';

export class NotificationsListQueryDto {
    @ApiPropertyOptional({ description: '1-based page number', default: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ description: 'Items per page', default: 20 })
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ enum: NotificationStatus })
    @IsEnum(NotificationStatus)
    @IsOptional()
    status?: NotificationStatus;

    @ApiPropertyOptional({ enum: NotificationContextType })
    @IsEnum(NotificationContextType)
    @IsOptional()
    contextType?: NotificationContextType;

    @ApiPropertyOptional({ enum: Channel })
    @IsEnum(Channel)
    @IsOptional()
    channelUsed?: Channel;

    @ApiPropertyOptional({ description: 'Optional free-text search over title/message' })
    @IsString()
    @IsOptional()
    q?: string;
}
