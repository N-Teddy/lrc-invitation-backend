import { NotificationContextType } from '../../common/enums/notification.enum';
export declare class InteractionEventDto {
    id: string;
    userId: string;
    userName: string;
    notificationId?: string;
    contextType: NotificationContextType;
    contextId: string;
    actionId: string;
    meta?: Record<string, any>;
    createdAt: Date;
}
export declare class InteractionEventsListResponseDto {
    items: InteractionEventDto[];
    nextCursor?: string;
}
