import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from '../schema/settings.schema';
import { AppConfigService } from '../config/app-config.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: Settings.name, schema: SettingsSchema }])],
    providers: [SettingsService, AppConfigService],
    controllers: [SettingsController],
    exports: [SettingsService, AppConfigService],
})
export class SettingsModule {}
