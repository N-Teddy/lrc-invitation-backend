import { NotificationContextType } from '../../common/enums/notification.enum';
export declare class InteractionListQueryDto {
    limit?: number;
    cursor?: string;
}
export declare class InteractionContextParamsDto {
    contextType: NotificationContextType;
    contextId: string;
}
