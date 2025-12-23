import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ timestamps: true })
export class Settings {
    @Prop({ required: true, unique: true })
    key: string;

    @Prop({ type: Object })
    value: Record<string, any>;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
SettingsSchema.index({ key: 1 }, { unique: true });
