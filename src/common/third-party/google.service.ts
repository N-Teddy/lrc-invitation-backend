import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { AppConfigService } from '../../config/app-config.service';

@Injectable()
export class GoogleService {
    private readonly client: OAuth2Client;

    constructor(private readonly config: AppConfigService) {
        this.client = new OAuth2Client();
    }

    async verifyIdToken(idToken: string): Promise<TokenPayload> {
        const audience = this.config.googleClientId;
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new UnauthorizedException('Invalid Google token');
        }
        return payload;
    }
}
