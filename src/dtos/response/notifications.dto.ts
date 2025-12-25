import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    Channel,
    NotificationContextType,
    NotificationStatus,
} from '../../common/enums/notification.enum';

export class NotificationListItemDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: NotificationContextType })
    contextType: NotificationContextType;

    @ApiProperty()
    contextId: string;

    @ApiProperty({ enum: NotificationStatus })
    status: NotificationStatus;

    @ApiProperty({ enum: Channel })
    primaryChannel: Channel;

    @ApiProperty({ enum: Channel })
    channelUsed: Channel;

    @ApiPropertyOptional()
    fallbackUsed?: boolean;

    @ApiPropertyOptional()
    title?: string;

    @ApiPropertyOptional()
    message?: string;

    @ApiPropertyOptional()
    error?: string;

    @ApiPropertyOptional()
    attempts?: number;

    @ApiPropertyOptional()
    maxAttempts?: number;

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    sentAt?: Date;
}

export class NotificationsListResponseDto {
    @ApiProperty({ type: [NotificationListItemDto] })
    items: NotificationListItemDto[];

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    total: number;

    @ApiProperty()
    hasMore: boolean;
}

export class NotificationDetailsDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: NotificationContextType })
    contextType: NotificationContextType;

    @ApiProperty()
    contextId: string;

    @ApiProperty({ enum: NotificationStatus })
    status: NotificationStatus;

    @ApiProperty({ enum: Channel })
    primaryChannel: Channel;

    @ApiProperty({ enum: Channel })
    channelUsed: Channel;

    @ApiPropertyOptional()
    fallbackUsed?: boolean;

    @ApiPropertyOptional()
    skipReason?: string;

    @ApiPropertyOptional()
    templateName?: string;

    @ApiPropertyOptional()
    templateLanguage?: string;

    @ApiPropertyOptional()
    languageUsed?: string;

    @ApiPropertyOptional()
    languageFallbackUsed?: boolean;

    @ApiPropertyOptional()
    payload?: Record<string, any>;

    @ApiPropertyOptional()
    error?: string;

    @ApiPropertyOptional()
    attempts?: number;

    @ApiPropertyOptional()
    maxAttempts?: number;

    @ApiPropertyOptional()
    nextAttemptAt?: Date;

    @ApiPropertyOptional()
    lastAttemptAt?: Date;

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    updatedAt?: Date;

    @ApiPropertyOptional()
    sentAt?: Date;
}
