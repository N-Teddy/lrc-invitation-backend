import { JwtService } from '@nestjs/jwt';
import { NotificationContextType } from '../enums/notification.enum';
import { AppConfigService } from '../../config/app-config.service';
export interface ActionTokenPayload {
    typ: 'action';
    sub: string;
    notificationId: string;
    contextType: NotificationContextType;
    contextId: string;
    actionId: string;
    redirectUrl?: string;
}
export declare class ActionTokensService {
    private readonly jwtService;
    private readonly config;
    constructor(jwtService: JwtService, config: AppConfigService);
    sign(payload: ActionTokenPayload, expiresAt: Date): string;
    verify(token: string): Promise<ActionTokenPayload>;
}
