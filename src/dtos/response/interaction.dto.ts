import { ApiProperty } from '@nestjs/swagger';
import { NotificationContextType } from '../../common/enums/notification.enum';

export class InteractionEventDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    userName: string;

    @ApiProperty({ required: false })
    notificationId?: string;

    @ApiProperty({ enum: NotificationContextType })
    contextType: NotificationContextType;

    @ApiProperty()
    contextId: string;

    @ApiProperty()
    actionId: string;

    @ApiProperty({ required: false })
    meta?: Record<string, any>;

    @ApiProperty()
    createdAt: Date;
}

export class InteractionEventsListResponseDto {
    @ApiProperty({ type: [InteractionEventDto] })
    items: InteractionEventDto[];

    @ApiProperty({ required: false, description: 'Next cursor (createdAt ms timestamp)' })
    nextCursor?: string;
}
