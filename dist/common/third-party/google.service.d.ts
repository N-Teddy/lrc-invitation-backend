import { TokenPayload } from 'google-auth-library';
import { AppConfigService } from '../../config/app-config.service';
export declare class GoogleService {
    private readonly config;
    private readonly client;
    constructor(config: AppConfigService);
    verifyIdToken(idToken: string): Promise<TokenPayload>;
}
