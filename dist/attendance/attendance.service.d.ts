import { Model, Types } from 'mongoose';
import { ActivityDocument } from '../schema/activity.schema';
import { Attendance, AttendanceDocument } from '../schema/attendance.schema';
import { UserDocument } from '../schema/user.schema';
import { ChildProfileDocument } from '../schema/child-profile.schema';
import { UpsertAttendanceDto } from '../dtos/request/attendance.dto';
import { AttendanceRoleAtTime, ClassificationLabel } from '../common/enums/attendance.enum';
import { ChildGroup, Town } from '../common/enums/activity.enum';
import { ReportingService } from '../reporting/reporting.service';
import { TownScopeService } from '../common/services/town-scope.service';
import { SettingsService } from '../settings/settings.service';
import { MonitorProfileDocument } from '../schema/monitor-profile.schema';
import { AttendanceEligibleChildrenResponseDto, AttendanceRosterResponseDto } from '../dtos/response/attendance-roster.dto';
export declare class AttendanceService {
    private readonly attendanceModel;
    private readonly activityModel;
    private readonly userModel;
    private readonly childProfileModel;
    private readonly monitorProfileModel;
    private readonly reportingService;
    private readonly townScopeService;
    private readonly settingsService;
    constructor(attendanceModel: Model<AttendanceDocument>, activityModel: Model<ActivityDocument>, userModel: Model<UserDocument>, childProfileModel: Model<ChildProfileDocument>, monitorProfileModel: Model<MonitorProfileDocument>, reportingService: ReportingService, townScopeService: TownScopeService, settingsService: SettingsService);
    getByActivityId(activityId: string, currentUser: Record<string, any>, scopeTown?: Town): Promise<{
        activityId: string;
        entries: any[];
        externalEntries: any[];
    } | {
        entries: any[];
        externalEntries: any[];
        _id: Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
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
            <ModelType = Model<Attendance, {}, {}, {}, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof Attendance>(path: T, type?: any, options?: any): Attendance[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        invalidate: {
            <T extends keyof Attendance>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof Attendance>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof Attendance>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof Attendance>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = Model<Attendance, {}, {}, {}, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
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
            <T extends keyof Attendance>(path: T, val: Attendance[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
        };
        toJSON: {
            <T = Attendance & {
                _id: Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = Attendance & {
                _id: Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = Attendance & {
            _id: Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof Attendance>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof Attendance>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
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
            <T extends keyof Attendance>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        activityId: Types.ObjectId;
        takenByUserId?: Types.ObjectId;
        takenAt?: Date;
    }>;
    upsertForActivity(activityId: string, dto: UpsertAttendanceDto, currentUser: Record<string, any>, scopeTown?: Town): Promise<{
        entries: import("mongoose").FlattenMaps<{
            userId: Types.ObjectId;
            present: boolean;
            roleAtTime: AttendanceRoleAtTime;
            originTownAtTime?: Town;
            groupAtTime?: ChildGroup;
            classificationLabel?: ClassificationLabel;
        }>[];
        externalEntries: any;
        _id: Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
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
            <ModelType = Model<Attendance, {}, {}, {}, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof Attendance>(path: T, type?: any, options?: any): Attendance[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        invalidate: {
            <T extends keyof Attendance>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof Attendance>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof Attendance>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof Attendance>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = Model<Attendance, {}, {}, {}, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
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
            <T extends keyof Attendance>(path: T, val: Attendance[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
                _id: Types.ObjectId;
            };
        };
        toJSON: {
            <T = Attendance & {
                _id: Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = Attendance & {
                _id: Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = Attendance & {
            _id: Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof Attendance>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, Attendance> & Attendance & {
            _id: Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof Attendance>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
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
            <T extends keyof Attendance>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        activityId: Types.ObjectId;
        takenByUserId?: Types.ObjectId;
        takenAt?: Date;
    }>;
    getRoster(activityId: string, currentUser: Record<string, any>, scopeTown?: Town): Promise<AttendanceRosterResponseDto>;
    searchEligibleChildren(activityId: string, query: string, limit: number, currentUser: Record<string, any>, scopeTown?: Town): Promise<AttendanceEligibleChildrenResponseDto>;
    private assertCanAccessAttendance;
    private getAgeToGroupMapping;
    private resolveScopeTown;
    private isLocked;
    private assertNotLocked;
    private listMonitorsForTown;
    private classificationForChildGroup;
}
