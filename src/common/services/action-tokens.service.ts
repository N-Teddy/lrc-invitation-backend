import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ActionTokensService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly config: AppConfigService,
    ) {}

    sign(payload: ActionTokenPayload, expiresAt: Date) {
        const ttlSeconds = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
        return this.jwtService.sign(payload, {
            secret: this.config.actionTokenSecret,
            expiresIn: ttlSeconds,
        });
    }

    async verify(token: string): Promise<ActionTokenPayload> {
        return (await this.jwtService.verifyAsync(token, {
            secret: this.config.actionTokenSecret,
        })) as ActionTokenPayload;
    }
}
