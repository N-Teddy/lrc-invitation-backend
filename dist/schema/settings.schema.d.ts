import { HydratedDocument } from 'mongoose';
export type SettingsDocument = HydratedDocument<Settings>;
export declare class Settings {
    key: string;
    value: Record<string, any>;
}
export declare const SettingsSchema: import("mongoose").Schema<Settings, import("mongoose").Model<Settings, any, any, any, import("mongoose").Document<unknown, any, Settings> & Settings & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Settings, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Settings>> & import("mongoose").FlatRecord<Settings> & {
    _id: import("mongoose").Types.ObjectId;
}>;
