import { ApiProperty } from '@nestjs/swagger';
import { ChildGroup, Town } from '../../common/enums/activity.enum';
import { ClassificationLabel } from '../../common/enums/attendance.enum';

export class AgeBandResponseDto {
    @ApiProperty({ enum: ChildGroup })
    group: ChildGroup;

    @ApiProperty()
    minAgeYears: number;

    @ApiProperty()
    maxAgeYears: number;
}

export class AgeToGroupMappingResponseDto {
    @ApiProperty({ type: [AgeBandResponseDto] })
    bands: AgeBandResponseDto[];
}

export class ClassificationLabelsResponseDto {
    @ApiProperty({ type: [String], enum: ClassificationLabel })
    labels: ClassificationLabel[];
}

export class LanguagesResponseDto {
    @ApiProperty({ example: ['en', 'fr'] })
    supportedLanguages: string[];

    @ApiProperty({ example: 'en' })
    defaultLanguage: string;
}

export class RecipientSelectorResponseDto {
    @ApiProperty({ example: 'super_monitors' })
    type: string;

    @ApiProperty({ required: false, type: [String] })
    userIds?: string[];
}

export class NotificationRecipientsRuleResponseDto {
    @ApiProperty()
    kind: string;

    @ApiProperty({ enum: Town, required: false })
    town?: Town;

    @ApiProperty({ type: [RecipientSelectorResponseDto] })
    selectors: RecipientSelectorResponseDto[];
}

export class NotificationRecipientsResponseDto {
    @ApiProperty({ type: [NotificationRecipientsRuleResponseDto] })
    rules: NotificationRecipientsRuleResponseDto[];
}

export class MediaStorageResponseDto {
    @ApiProperty({ required: false, enum: ['local', 'cloudinary'] })
    providerHint?: 'local' | 'cloudinary';

    @ApiProperty({ required: false })
    maxSizeBytes?: number;

    @ApiProperty({ required: false, type: [String] })
    allowedMimeTypes?: string[];
}

export class ActivityYearLocksResponseDto {
    @ApiProperty({ type: [Number], example: [2024, 2025] })
    lockedYears: number[];
}

export class AuthModeSettingsResponseDto {
    @ApiProperty({ enum: ['magic_link', 'direct_email'] })
    mode: 'magic_link' | 'direct_email';
}
