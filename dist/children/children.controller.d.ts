import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { BulkCreateChildrenDto, CreateChildMultipartDto } from '../dtos/request/child.dto';
import { ChildrenService } from './children.service';
export declare class ChildrenController {
    private readonly childrenService;
    constructor(childrenService: ChildrenService);
    list(q: string | undefined, includeArchived: string | undefined, page: string | undefined, limit: string | undefined, currentUser: any): Promise<{
        items: any[];
        page: number;
        limit: number;
        total: number;
        missingProfileImageCount: number;
    }>;
    get(id: string, currentUser: any): Promise<{
        group: import("../common/enums/activity.enum").ChildGroup | undefined;
        guardians: any;
        _id: import("mongoose").Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<import("../schema/user.schema").User, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof import("../schema/user.schema").User>(path: T, type?: any, options?: any): import("../schema/user.schema").User[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        invalidate: {
            <T extends keyof import("../schema/user.schema").User>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof import("../schema/user.schema").User>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof import("../schema/user.schema").User>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof import("../schema/user.schema").User>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof import("../schema/user.schema").User>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof import("../schema/user.schema").User>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof import("../schema/user.schema").User>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<import("../schema/user.schema").User, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: import("mongoose").Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: string]: any;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: string]: any;
        }>> & import("mongoose").FlatRecord<{
            [x: string]: any;
        }> & Required<{
            _id: unknown;
        }>>>;
        set: {
            <T extends keyof import("../schema/user.schema").User>(path: T, val: import("../schema/user.schema").User[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        toJSON: {
            <T = import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof import("../schema/user.schema").User>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof import("../schema/user.schema").User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
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
            <T extends keyof import("../schema/user.schema").User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        fullName: string;
        email?: string;
        role: UserRole;
        monitorLevel?: MonitorLevel;
        dateOfBirth?: Date;
        originTown?: import("../common/enums/activity.enum").Town;
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
        lifecycleStatus: import("../common/enums/user.enum").LifecycleStatus;
        archivedReason?: string;
    }>;
    stats(id: string, currentUser: any): Promise<{
        childId: string;
        totalAttendanceRecords: number;
        presentCount: number;
        absentCount: number;
        lastAttendanceAt: Date;
        lastPresentAt: Date;
        byActivityType: {
            activityType: import("../common/enums/activity.enum").ActivityType;
            totalRecords: number;
            presentCount: number;
            absentCount: number;
            lastPresentAt: Date;
        }[];
    }>;
    create(dto: CreateChildMultipartDto, file: any, currentUser: any): Promise<{
        group: import("../common/enums/activity.enum").ChildGroup;
        guardians: {
            fullName: string;
            phoneE164: string;
            relationship: string;
            email?: string;
        }[];
        _id: import("mongoose").Types.ObjectId;
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
        originTown?: import("../common/enums/activity.enum").Town;
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
        lifecycleStatus: import("../common/enums/user.enum").LifecycleStatus;
        archivedReason?: string;
    }>;
    bulk(dto: BulkCreateChildrenDto, currentUser: any): Promise<{
        created: any[];
        errors: {
            index: number;
            message: string;
        }[];
    }>;
    uploadProfileImage(id: string, file: any, currentUser: any): Promise<{
        group: import("../common/enums/activity.enum").ChildGroup | undefined;
        guardians: any;
        _id: import("mongoose").Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<import("../schema/user.schema").User, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof import("../schema/user.schema").User>(path: T, type?: any, options?: any): import("../schema/user.schema").User[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        invalidate: {
            <T extends keyof import("../schema/user.schema").User>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof import("../schema/user.schema").User>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof import("../schema/user.schema").User>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof import("../schema/user.schema").User>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof import("../schema/user.schema").User>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof import("../schema/user.schema").User>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof import("../schema/user.schema").User>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<import("../schema/user.schema").User, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: import("mongoose").Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: string]: any;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: string]: any;
        }>> & import("mongoose").FlatRecord<{
            [x: string]: any;
        }> & Required<{
            _id: unknown;
        }>>>;
        set: {
            <T extends keyof import("../schema/user.schema").User>(path: T, val: import("../schema/user.schema").User[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        toJSON: {
            <T = import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof import("../schema/user.schema").User>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof import("../schema/user.schema").User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
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
            <T extends keyof import("../schema/user.schema").User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        fullName: string;
        email?: string;
        role: UserRole;
        monitorLevel?: MonitorLevel;
        dateOfBirth?: Date;
        originTown?: import("../common/enums/activity.enum").Town;
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
        lifecycleStatus: import("../common/enums/user.enum").LifecycleStatus;
        archivedReason?: string;
    }>;
    archive(id: string, currentUser: any): Promise<{
        group: import("../common/enums/activity.enum").ChildGroup | undefined;
        guardians: any;
        _id: import("mongoose").Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<import("../schema/user.schema").User, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof import("../schema/user.schema").User>(path: T, type?: any, options?: any): import("../schema/user.schema").User[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        invalidate: {
            <T extends keyof import("../schema/user.schema").User>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof import("../schema/user.schema").User>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof import("../schema/user.schema").User>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof import("../schema/user.schema").User>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof import("../schema/user.schema").User>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof import("../schema/user.schema").User>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof import("../schema/user.schema").User>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<import("../schema/user.schema").User, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: import("mongoose").Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: string]: any;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: string]: any;
        }>> & import("mongoose").FlatRecord<{
            [x: string]: any;
        }> & Required<{
            _id: unknown;
        }>>>;
        set: {
            <T extends keyof import("../schema/user.schema").User>(path: T, val: import("../schema/user.schema").User[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        toJSON: {
            <T = import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = import("../schema/user.schema").User & {
                _id: import("mongoose").Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof import("../schema/user.schema").User>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/user.schema").User> & import("../schema/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof import("../schema/user.schema").User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
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
            <T extends keyof import("../schema/user.schema").User>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        fullName: string;
        email?: string;
        role: UserRole;
        monitorLevel?: MonitorLevel;
        dateOfBirth?: Date;
        originTown?: import("../common/enums/activity.enum").Town;
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
        lifecycleStatus: import("../common/enums/user.enum").LifecycleStatus;
        archivedReason?: string;
    }>;
}
