import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import {
    SetAgeToGroupMappingRequestDto,
    SetClassificationLabelsRequestDto,
    SetLanguagesRequestDto,
    SetMediaStorageRequestDto,
    SetNotificationRecipientsRequestDto,
    LockActivityYearRequestDto,
    SetAuthModeRequestDto,
} from '../dtos/request/settings.dto';
import {
    AgeToGroupMappingResponseDto,
    ClassificationLabelsResponseDto,
    LanguagesResponseDto,
    MediaStorageResponseDto,
    NotificationRecipientsResponseDto,
    ActivityYearLocksResponseDto,
    AuthModeSettingsResponseDto,
} from '../dtos/response/settings.dto';
import { SettingsService } from './settings.service';

@ApiBearerAuth()
@ApiTags('settings')
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Roles([UserRole.Monitor])
    @Get('age-to-group-mapping')
    @ApiOkResponse({ type: AgeToGroupMappingResponseDto })
    getAgeToGroupMapping() {
        return this.settingsService.getAgeToGroupMapping();
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Put('age-to-group-mapping')
    @ApiOkResponse({ type: AgeToGroupMappingResponseDto })
    setAgeToGroupMapping(@Body() dto: SetAgeToGroupMappingRequestDto) {
        return this.settingsService.setAgeToGroupMapping(dto.bands);
    }

    @Roles([UserRole.Monitor])
    @Get('classification-labels')
    @ApiOkResponse({ type: ClassificationLabelsResponseDto })
    getClassificationLabels() {
        return this.settingsService.getClassificationLabels();
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Put('classification-labels')
    @ApiOkResponse({ type: ClassificationLabelsResponseDto })
    setClassificationLabels(@Body() dto: SetClassificationLabelsRequestDto) {
        return this.settingsService.setClassificationLabels(dto.labels);
    }

    @Roles([UserRole.Monitor])
    @Get('languages')
    @ApiOkResponse({ type: LanguagesResponseDto })
    getLanguages() {
        return this.settingsService.getLanguages();
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Put('languages')
    @ApiOkResponse({ type: LanguagesResponseDto })
    setLanguages(@Body() dto: SetLanguagesRequestDto) {
        return this.settingsService.setLanguages(dto.supportedLanguages, dto.defaultLanguage);
    }

    @Roles([UserRole.Monitor])
    @Get('notification-recipients')
    @ApiOkResponse({ type: NotificationRecipientsResponseDto })
    getNotificationRecipients() {
        return this.settingsService.getNotificationRecipients();
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Put('notification-recipients')
    @ApiOkResponse({ type: NotificationRecipientsResponseDto })
    setNotificationRecipients(@Body() dto: SetNotificationRecipientsRequestDto) {
        return this.settingsService.setNotificationRecipients(dto.rules);
    }

    @Roles([UserRole.Monitor])
    @Get('media-storage')
    @ApiOkResponse({ type: MediaStorageResponseDto })
    getMediaStorage() {
        return this.settingsService.getMediaStorageSettings();
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Put('media-storage')
    @ApiOkResponse({ type: MediaStorageResponseDto })
    setMediaStorage(@Body() dto: SetMediaStorageRequestDto) {
        return this.settingsService.setMediaStorageSettings(dto);
    }

    @Roles([UserRole.Monitor])
    @Get('activity-years')
    @ApiOkResponse({ type: ActivityYearLocksResponseDto })
    getActivityYears() {
        return this.settingsService.getActivityYearLocks();
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Put('activity-years/lock')
    @ApiOkResponse({ type: ActivityYearLocksResponseDto })
    lockActivityYear(@Body() dto: LockActivityYearRequestDto) {
        return this.settingsService.lockActivityYear(dto.year);
    }

    @Roles([UserRole.Monitor])
    @Get('auth-mode')
    @ApiOkResponse({ type: AuthModeSettingsResponseDto })
    getAuthMode() {
        return this.settingsService.getAuthMode();
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Put('auth-mode')
    @ApiOkResponse({ type: AuthModeSettingsResponseDto })
    setAuthMode(@Body() dto: SetAuthModeRequestDto) {
        return this.settingsService.setAuthMode(dto.mode);
    }
}
