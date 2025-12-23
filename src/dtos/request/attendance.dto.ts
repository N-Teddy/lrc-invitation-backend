import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassificationLabel } from '../../common/enums/attendance.enum';

export class AttendanceEntryRequestDto {
    @ApiProperty()
    @IsMongoId()
    userId: string;

    @ApiProperty()
    @IsBoolean()
    present: boolean;

    @ApiProperty({ enum: ClassificationLabel, required: false })
    @IsEnum(ClassificationLabel)
    @IsOptional()
    classificationLabel?: ClassificationLabel;
}

export class UpsertAttendanceDto {
    @ApiProperty({ type: [AttendanceEntryRequestDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttendanceEntryRequestDto)
    entries: AttendanceEntryRequestDto[];
}
