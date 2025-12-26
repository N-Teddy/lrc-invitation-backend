import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsEnum,
    IsIn,
    IsInt,
    IsMongoId,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChildGroup, Town } from '../../common/enums/activity.enum';
import { ClassificationLabel } from '../../common/enums/attendance.enum';
import { RecipientSelectorType } from '../../common/enums/settings.enum';

export class AgeBandRequestDto {
    @ApiProperty({ enum: ChildGroup })
    @IsEnum(ChildGroup)
    group: ChildGroup;

    @ApiProperty({ minimum: 0 })
    @IsInt()
    @Min(0)
    minAgeYears: number;

    @ApiProperty({ minimum: 0 })
    @IsInt()
    @Min(0)
    @Max(200)
    maxAgeYears: number;
}

export class SetAgeToGroupMappingRequestDto {
    @ApiProperty({ type: [AgeBandRequestDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AgeBandRequestDto)
    bands: AgeBandRequestDto[];
}

export class SetClassificationLabelsRequestDto {
    @ApiProperty({ type: [String], enum: ClassificationLabel })
    @IsArray()
    @IsEnum(ClassificationLabel, { each: true })
    labels: ClassificationLabel[];
}

export class SetLanguagesRequestDto {
    @ApiProperty({ example: ['en', 'fr'] })
    @IsArray()
    @IsString({ each: true })
    supportedLanguages: string[];

    @ApiProperty({ example: 'en' })
    @IsString()
    defaultLanguage: string;
}

export class RecipientSelectorRequestDto {
    @ApiProperty({ enum: RecipientSelectorType })
    @IsEnum(RecipientSelectorType)
    type: RecipientSelectorType;

    @ApiProperty({ required: false, type: [String] })
    @ValidateIf((v) => v.type === RecipientSelectorType.ExplicitUsers)
    @IsArray()
    @IsMongoId({ each: true })
    userIds?: string[];
}

export class NotificationRecipientsRuleRequestDto {
    @ApiProperty({ example: 'group_change' })
    @IsString()
    kind: string;

    @ApiProperty({ enum: Town, required: false })
    @IsOptional()
    @IsEnum(Town)
    town?: Town;

    @ApiProperty({ type: [RecipientSelectorRequestDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecipientSelectorRequestDto)
    selectors: RecipientSelectorRequestDto[];
}

export class SetNotificationRecipientsRequestDto {
    @ApiProperty({ type: [NotificationRecipientsRuleRequestDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NotificationRecipientsRuleRequestDto)
    rules: NotificationRecipientsRuleRequestDto[];
}

export class SetMediaStorageRequestDto {
    @ApiProperty({ required: false, enum: ['local', 'cloudinary'] })
    @IsOptional()
    @IsIn(['local', 'cloudinary'])
    providerHint?: 'local' | 'cloudinary';

    @ApiProperty({ required: false, example: 5_000_000 })
    @IsOptional()
    @IsInt()
    @Min(0)
    maxSizeBytes?: number;

    @ApiProperty({ required: false, example: ['image/jpeg', 'image/png', 'image/webp'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedMimeTypes?: string[];
}

export class LockActivityYearRequestDto {
    @ApiProperty({ example: 2026 })
    @IsInt()
    @Min(2000)
    @Max(2100)
    year: number;
}

export class SetAuthModeRequestDto {
    @ApiProperty({ enum: ['magic_link', 'direct_email'] })
    @IsIn(['magic_link', 'direct_email'])
    mode: 'magic_link' | 'direct_email';
}
