import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsMongoId,
    IsString,
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
