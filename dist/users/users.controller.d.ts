import { CreateUserDto, UpdateMyPreferencesDto, UpdateUserDto } from '../dtos/request/user.dto';
import { UsersService } from './users.service';
import { MediaService } from '../media/media.service';
import { NotificationService } from '../notifications/notifications.service';
import { AppConfigService } from '../config/app-config.service';
export declare class UsersController {
    private readonly usersService;
    private readonly mediaService;
    private readonly notificationService;
    private readonly config;
    constructor(usersService: UsersService, mediaService: MediaService, notificationService: NotificationService, config: AppConfigService);
    create(dto: CreateUserDto): Promise<Record<string, any>>;
    findAll(): Promise<Record<string, any>[]>;
    findOne(id: string): Promise<Record<string, any>>;
    update(id: string, dto: UpdateUserDto): Promise<Record<string, any>>;
    updateMe(dto: UpdateMyPreferencesDto, currentUser: any): Promise<Record<string, any>>;
    approve(id: string, currentUser: any): Promise<{
        approved: boolean;
        magicLinkSent: boolean;
        user: Record<string, any>;
    }>;
    uploadProfileImage(id: string, file: any, currentUser: any): Promise<Record<string, any>>;
    remove(id: string): Promise<void>;
}
