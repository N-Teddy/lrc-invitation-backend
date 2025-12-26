import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class GuardianDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty({ description: 'Phone number in E.164 format (example: +237693087159)' })
    @IsString()
    phoneE164: string;

    @ApiProperty({ description: 'Relationship to the child (example: Mother, Father, Guardian)' })
    @IsString()
    relationship: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    email?: string;
}

export class CreateChildDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty({ description: 'Required. ISO date string (YYYY-MM-DD recommended).' })
    @IsDateString()
    dateOfBirth: string;

    @ApiProperty({
        type: [GuardianDto],
        description: 'At least one parent/guardian contact is required.',
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => GuardianDto)
    guardians: GuardianDto[];

    @ApiPropertyOptional({ description: 'Optional. Defaults to English.' })
    @IsString()
    @IsOptional()
    preferredLanguage?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    whatsAppPhoneE164?: string;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    whatsAppOptIn?: boolean;
}

export class CreateChildMultipartDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty({ description: 'Required. ISO date string (YYYY-MM-DD recommended).' })
    @IsDateString()
    dateOfBirth: string;

    @ApiProperty({
        description:
            'JSON stringified guardians array (at least 1). Example: [{"fullName":"...","phoneE164":"+237...","relationship":"Mother"}]',
    })
    @IsString()
    guardiansJson: string;

    @ApiPropertyOptional({ description: 'Optional. Defaults to English.' })
    @IsString()
    @IsOptional()
    preferredLanguage?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    whatsAppPhoneE164?: string;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    whatsAppOptIn?: boolean;
}

export class BulkCreateChildrenDto {
    @ApiProperty({ type: [CreateChildDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateChildDto)
    children: CreateChildDto[];
}

export class BulkCreateChildrenMultipartDto {
    @ApiProperty({
        description:
            'JSON stringified children array. Each child must include guardians (at least 1).',
        example:
            '[{"fullName":"John Doe","dateOfBirth":"2014-06-02","preferredLanguage":"en","guardians":[{"fullName":"Jane Doe","phoneE164":"+237693087159","relationship":"Mother"}]}]',
    })
    @IsString()
    childrenJson: string;
}
