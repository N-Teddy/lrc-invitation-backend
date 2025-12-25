import { Model, Types } from 'mongoose';
import { TownScopeService } from '../common/services/town-scope.service';
import { MediaService } from '../media/media.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationService } from '../notifications/notifications.service';
import { AppConfigService } from '../config/app-config.service';
import { User, UserDocument } from '../schema/user.schema';
import { ChildProfileDocument } from '../schema/child-profile.schema';
import { CreateChildDto } from '../dtos/request/child.dto';
import { ActivityType, ChildGroup, Town } from '../common/enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { UsersService } from '../users/users.service';
import { UploadedFile } from '../common/interfaces/uploaded-file.interface';
import { AttendanceDocument } from '../schema/attendance.schema';
import { ActivityDocument } from '../schema/activity.schema';
type GuardianInput = {
    fullName: string;
    phoneE164: string;
    relationship: string;
    email?: string;
};
type CreateChildMultipartInput = {
    fullName: string;
    dateOfBirth: string;
    guardiansJson: string;
    preferredLanguage?: string;
    whatsAppPhoneE164?: string;
    whatsAppOptIn?: boolean;
};
export declare class ChildrenService {
    private readonly userModel;
    private readonly childProfileModel;
    private readonly attendanceModel;
    private readonly activityModel;
    private readonly townScopeService;
    private readonly settingsService;
    private readonly mediaService;
    private readonly notificationService;
    private readonly usersService;
    private readonly config;
    constructor(userModel: Model<UserDocument>, childProfileModel: Model<ChildProfileDocument>, attendanceModel: Model<AttendanceDocument>, activityModel: Model<ActivityDocument>, townScopeService: TownScopeService, settingsService: SettingsService, mediaService: MediaService, notificationService: NotificationService, usersService: UsersService, config: AppConfigService);
    list(filters: {
        q?: string;
        includeArchived?: boolean;
        page?: number;
        limit?: number;
    }, currentUser: Record<string, any>): Promise<{
        items: any[];
        page: number;
        limit: number;
        total: number;
        missingProfileImageCount: number;
    }>;
    get(id: string, currentUser: Record<string, any>): Promise<{
        group: ChildGroup | undefined;
        guardians: any;
        _id: Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = Model<User, {}, {}, {}, import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof User>(path: T, type?: any, options?: any): User[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        invalidate: {
            <T extends keyof User>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof User>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof User>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof User>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof User>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof User>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof User>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = Model<User, {}, {}, {}, import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: string]: any;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: string]: any;
        }>> & import("mongoose").FlatRecord<{
            [x: string]: any;
        }> & Required<{
            _id: unknown;
        }>>>;
        set: {
            <T extends keyof User>(path: T, val: User[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
        };
        toJSON: {
            <T = User & {
                _id: Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = User & {
                _id: Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = User & {
            _id: Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof User>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
            }): Promise<void>;
        };
        validateSync: {
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
                [k: string]: any;
            }): import("mongoose").Error.ValidationError | null;
            <T extends keyof User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        fullName: string;
        email?: string;
        role: UserRole;
        monitorLevel?: MonitorLevel;
        dateOfBirth?: Date;
        originTown?: Town;
        preferredLanguage?: string;
        whatsApp?: import("mongoose").FlattenMaps<{
            phoneE164?: string;
            optIn?: boolean;
        }>;
        profileImage?: import("mongoose").FlattenMaps<{
            url?: string;
            provider?: string;
            mimeType?: string;
            sizeBytes?: number;
            updatedAt?: Date;
        }>;
        registrationPendingApproval?: boolean;
        magicToken?: string;
        magicExpiresAt?: Date;
        googleId?: string;
        googleEmail?: string;
        googleLinkedAt?: Date;
        lifecycleStatus: LifecycleStatus;
        archivedReason?: string;
    }>;
    create(dto: CreateChildMultipartInput, file: UploadedFile | undefined, currentUser: Record<string, any>): Promise<{
        group: ChildGroup;
        guardians: GuardianInput[];
        _id: Types.ObjectId;
        __v?: any;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        fullName: string;
        email?: string;
        role: UserRole;
        monitorLevel?: MonitorLevel;
        dateOfBirth?: Date;
        originTown?: Town;
        preferredLanguage?: string;
        whatsApp?: {
            phoneE164?: string;
            optIn?: boolean;
        };
        profileImage?: {
            url?: string;
            provider?: string;
            mimeType?: string;
            sizeBytes?: number;
            updatedAt?: Date;
        };
        registrationPendingApproval?: boolean;
        magicToken?: string;
        magicExpiresAt?: Date;
        googleId?: string;
        googleEmail?: string;
        googleLinkedAt?: Date;
        lifecycleStatus: LifecycleStatus;
        archivedReason?: string;
    }>;
    bulkCreate(children: CreateChildDto[], currentUser: Record<string, any>): Promise<{
        created: any[];
        errors: {
            index: number;
            message: string;
        }[];
    }>;
    uploadProfileImage(childId: string, file: UploadedFile, currentUser: Record<string, any>): Promise<{
        group: ChildGroup | undefined;
        guardians: any;
        _id: Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = Model<User, {}, {}, {}, import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof User>(path: T, type?: any, options?: any): User[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        invalidate: {
            <T extends keyof User>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof User>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof User>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof User>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof User>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof User>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof User>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = Model<User, {}, {}, {}, import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: string]: any;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: string]: any;
        }>> & import("mongoose").FlatRecord<{
            [x: string]: any;
        }> & Required<{
            _id: unknown;
        }>>>;
        set: {
            <T extends keyof User>(path: T, val: User[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
        };
        toJSON: {
            <T = User & {
                _id: Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = User & {
                _id: Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = User & {
            _id: Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof User>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
            }): Promise<void>;
        };
        validateSync: {
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
                [k: string]: any;
            }): import("mongoose").Error.ValidationError | null;
            <T extends keyof User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        fullName: string;
        email?: string;
        role: UserRole;
        monitorLevel?: MonitorLevel;
        dateOfBirth?: Date;
        originTown?: Town;
        preferredLanguage?: string;
        whatsApp?: import("mongoose").FlattenMaps<{
            phoneE164?: string;
            optIn?: boolean;
        }>;
        profileImage?: import("mongoose").FlattenMaps<{
            url?: string;
            provider?: string;
            mimeType?: string;
            sizeBytes?: number;
            updatedAt?: Date;
        }>;
        registrationPendingApproval?: boolean;
        magicToken?: string;
        magicExpiresAt?: Date;
        googleId?: string;
        googleEmail?: string;
        googleLinkedAt?: Date;
        lifecycleStatus: LifecycleStatus;
        archivedReason?: string;
    }>;
    archive(childId: string, currentUser: Record<string, any>): Promise<{
        group: ChildGroup | undefined;
        guardians: any;
        _id: Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = Model<User, {}, {}, {}, import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof User>(path: T, type?: any, options?: any): User[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        invalidate: {
            <T extends keyof User>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof User>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof User>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof User>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof User>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof User>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof User>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = Model<User, {}, {}, {}, import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: string]: any;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: string]: any;
        }>> & import("mongoose").FlatRecord<{
            [x: string]: any;
        }> & Required<{
            _id: unknown;
        }>>>;
        set: {
            <T extends keyof User>(path: T, val: User[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, User> & User & {
                _id: Types.ObjectId;
            };
        };
        toJSON: {
            <T = User & {
                _id: Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = User & {
                _id: Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = User & {
            _id: Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof User>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, User> & User & {
            _id: Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
            }): Promise<void>;
        };
        validateSync: {
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
                [k: string]: any;
            }): import("mongoose").Error.ValidationError | null;
            <T extends keyof User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        fullName: string;
        email?: string;
        role: UserRole;
        monitorLevel?: MonitorLevel;
        dateOfBirth?: Date;
        originTown?: Town;
        preferredLanguage?: string;
        whatsApp?: import("mongoose").FlattenMaps<{
            phoneE164?: string;
            optIn?: boolean;
        }>;
        profileImage?: import("mongoose").FlattenMaps<{
            url?: string;
            provider?: string;
            mimeType?: string;
            sizeBytes?: number;
            updatedAt?: Date;
        }>;
        registrationPendingApproval?: boolean;
        magicToken?: string;
        magicExpiresAt?: Date;
        googleId?: string;
        googleEmail?: string;
        googleLinkedAt?: Date;
        lifecycleStatus: LifecycleStatus;
        archivedReason?: string;
    }>;
    getStats(childId: string, currentUser: Record<string, any>): Promise<{
        childId: string;
        totalAttendanceRecords: number;
        presentCount: number;
        absentCount: number;
        lastAttendanceAt: Date;
        lastPresentAt: Date;
        byActivityType: {
            activityType: ActivityType;
            totalRecords: number;
            presentCount: number;
            absentCount: number;
            lastPresentAt: Date;
        }[];
    }>;
    private assertCanCreate;
    private assertCanManageChild;
    private resolveMonitorTownOrFail;
    private notifyChildCreated;
    private notifyChildrenBulkCreated;
    private parseGuardians;
}
export {};
