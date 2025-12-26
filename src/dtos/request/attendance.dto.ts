import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsMongoId,
    IsOptional,
    IsString,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClassificationLabel } from '../../common/enums/attendance.enum';

export class AttendanceEntryRequestDto {
    @ApiProperty()
    @IsMongoId()
    userId: string;

    @ApiProperty()
    @IsBoolean()
    present: boolean;

    @ApiProperty({ required: false, description: 'Optional donation amount (FCFA).' })
    @IsInt()
    @Min(0)
    @IsOptional()
    donationFcfa?: number;
}

export class ExternalAttendanceEntryRequestDto {
    @ApiProperty({ enum: ClassificationLabel })
    @IsEnum(ClassificationLabel)
    classificationLabel: ClassificationLabel;

    @ApiProperty()
    @IsString()
    externalId: string;

    @ApiProperty()
    @IsString()
    @MinLength(2)
    fullName: string;

    @ApiProperty({ required: false, description: 'Optional donation amount (FCFA).' })
    @IsInt()
    @Min(0)
    @IsOptional()
    donationFcfa?: number;
}

export class UpsertAttendanceDto {
    @ApiProperty({ type: [AttendanceEntryRequestDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttendanceEntryRequestDto)
    entries: AttendanceEntryRequestDto[];

    @ApiProperty({ type: [ExternalAttendanceEntryRequestDto], required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExternalAttendanceEntryRequestDto)
    externalEntries?: ExternalAttendanceEntryRequestDto[];
}
