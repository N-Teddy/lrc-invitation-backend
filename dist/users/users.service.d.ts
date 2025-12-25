import { Model, Types } from 'mongoose';
import { UserDocument } from '../schema/user.schema';
import { MonitorProfileDocument } from '../schema/monitor-profile.schema';
import { CreateUserData, UpdateUserData } from '../common/interfaces/user-data.interface';
import { Town } from '../common/enums/activity.enum';
export declare class UsersService {
    private readonly userModel;
    private readonly monitorProfileModel;
    constructor(userModel: Model<UserDocument>, monitorProfileModel: Model<MonitorProfileDocument>);
    create(data: CreateUserData): Promise<Record<string, any>>;
    findAll(): Promise<Record<string, any>[]>;
    findById(id: string): Promise<Record<string, any> | null>;
    findByEmail(email: string): Promise<Record<string, any> | null>;
    findByMagicToken(token: string): Promise<Record<string, any> | null>;
    findByMagicTokenForAuth(token: string): Promise<Record<string, any> | null>;
    setMagicToken(userId: string | Types.ObjectId, magicToken: string, magicExpiresAt: Date): Promise<void>;
    clearMagicToken(userId: string | Types.ObjectId): Promise<void>;
    findByGoogleId(googleId: string): Promise<Record<string, any> | null>;
    linkGoogle(userId: string | Types.ObjectId, googleId: string, googleEmail: string): Promise<void>;
    findOneOrFail(id: string): Promise<Record<string, any>>;
    update(id: string, data: UpdateUserData): Promise<Record<string, any>>;
    updateProfileImage(userId: string, profileImage: Record<string, any>): Promise<Record<string, any>>;
    updateMyPreferences(currentUser: Record<string, any>, dto: {
        preferredLanguage?: string;
    }): Promise<Record<string, any>>;
    remove(id: string): Promise<void>;
    approveMonitorRegistration(userId: string): Promise<{
        user: Record<string, any>;
        magicToken?: string;
        magicExpiresAt?: Date;
    }>;
    assertCanApproveMonitorRegistration(approver: Record<string, any>, targetUserId: string): Promise<void>;
    findSuperMonitorsByTownForApproval(town: Town): Promise<Array<{
        id: string;
        email?: string;
        fullName: string;
        preferredLanguage?: string;
    }>>;
    findAllSuperMonitors(): Promise<Array<{
        id: string;
        email?: string;
        fullName: string;
        preferredLanguage?: string;
    }>>;
    hasSuperMonitorsInTown(town: Town): Promise<boolean>;
    getMonitorHomeTown(userId: string | Types.ObjectId): Promise<Town | undefined>;
    private normalizeUser;
}
