import { IsInt, IsEnum, IsOptional, IsArray, ArrayMinSize, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';

export class CreateInvitationDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    childId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    activityId: number;
}

export class UpdateInvitationDto {
    @ApiPropertyOptional({ enum: InvitationStatus })
    @IsOptional()
    @IsEnum(InvitationStatus)
    status?: InvitationStatus;
}

export class BulkInvitationDto {
    @ApiProperty({ example: [1, 2, 3, 4, 5], type: [Number] })
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    childIds: number[];

    @ApiProperty({ example: 1 })
    @IsInt()
    activityId: number;
}

export class RespondToInvitationDto {
    @ApiProperty({ example: true, description: 'true for accept, false for decline' })
    @IsBoolean()
    accept: boolean;
}
