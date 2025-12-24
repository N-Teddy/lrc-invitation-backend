import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class CreateChildDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty({ description: 'Required. ISO date string (YYYY-MM-DD recommended).' })
    @IsDateString()
    dateOfBirth: string;

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
