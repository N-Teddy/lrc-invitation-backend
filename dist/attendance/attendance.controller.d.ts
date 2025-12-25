import { Town } from '../common/enums/activity.enum';
import { UpsertAttendanceDto } from '../dtos/request/attendance.dto';
import { AttendanceEligibleChildrenResponseDto, AttendanceRosterResponseDto } from '../dtos/response/attendance-roster.dto';
import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    get(activityId: string, scopeTown: Town | undefined, currentUser: any): Promise<{
        activityId: string;
        entries: any[];
        externalEntries: any[];
    } | {
        entries: any[];
        externalEntries: any[];
        _id: import("mongoose").Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
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
            <ModelType = import("mongoose").Model<import("../schema/attendance.schema").Attendance, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T, type?: any, options?: any): import("../schema/attendance.schema").Attendance[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        invalidate: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<import("../schema/attendance.schema").Attendance, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: import("mongoose").Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
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
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T, val: import("../schema/attendance.schema").Attendance[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        toJSON: {
            <T = import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
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
            <T extends keyof import("../schema/attendance.schema").Attendance>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        activityId: import("mongoose").Types.ObjectId;
        takenByUserId?: import("mongoose").Types.ObjectId;
        takenAt?: Date;
    }>;
    roster(activityId: string, scopeTown: Town | undefined, currentUser: any): Promise<AttendanceRosterResponseDto>;
    eligibleChildren(activityId: string, query: string, limit: string, scopeTown: Town | undefined, currentUser: any): Promise<AttendanceEligibleChildrenResponseDto>;
    upsert(activityId: string, dto: UpsertAttendanceDto, scopeTown: Town | undefined, currentUser: any): Promise<{
        entries: import("mongoose").FlattenMaps<{
            userId: import("mongoose").Types.ObjectId;
            present: boolean;
            roleAtTime: import("../common/enums/attendance.enum").AttendanceRoleAtTime;
            originTownAtTime?: Town;
            groupAtTime?: import("../common/enums/activity.enum").ChildGroup;
            classificationLabel?: import("../common/enums/attendance.enum").ClassificationLabel;
        }>[];
        externalEntries: any;
        _id: import("mongoose").Types.ObjectId;
        __v?: any;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, keyof Paths> & Paths;
        $clone: () => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
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
            <ModelType = import("mongoose").Model<import("../schema/attendance.schema").Attendance, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        depopulate: (path?: string | string[]) => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<unknown, any, any>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T, type?: any, options?: any): import("../schema/attendance.schema").Attendance[T];
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }>;
        id?: any;
        increment: () => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        invalidate: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
                _id: unknown;
            }>, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<import("../schema/attendance.schema").Attendance, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        };
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: import("mongoose").Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
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
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T, val: import("../schema/attendance.schema").Attendance[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
            (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            };
        };
        toJSON: {
            <T = import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
            }): import("mongoose").FlattenMaps<T>;
            <T = import("../schema/attendance.schema").Attendance & {
                _id: import("mongoose").Types.ObjectId;
            }>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
        };
        toObject: <T = import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>;
        unmarkModified: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, {}, import("mongoose").Document<unknown, {}, import("../schema/attendance.schema").Attendance> & import("../schema/attendance.schema").Attendance & {
            _id: import("mongoose").Types.ObjectId;
        }, "find">;
        validate: {
            <T extends keyof import("../schema/attendance.schema").Attendance>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
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
            <T extends keyof import("../schema/attendance.schema").Attendance>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        activityId: import("mongoose").Types.ObjectId;
        takenByUserId?: import("mongoose").Types.ObjectId;
        takenAt?: Date;
    }>;
}
