import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import { Town } from '../../common/enums/activity.enum';

export class CreatePaymentDto {
    @ApiProperty()
    @IsMongoId()
    monitorUserId: string;

    @ApiProperty({ description: 'Calendar year (e.g., 2025)' })
    @IsInt()
    @Min(2000)
    year: number;

    @ApiProperty({ description: 'Payment amount (FCFA). Must be > 0.' })
    @IsInt()
    @Min(1)
    amountFcfa: number;

    @ApiProperty({ description: 'Payment date (ISO string)' })
    @IsDateString()
    paidAt: string;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}

export class PaymentsQueryDto {
    @ApiPropertyOptional()
    @IsMongoId()
    @IsOptional()
    monitorUserId?: string;

    @ApiPropertyOptional()
    @IsInt()
    @Min(2000)
    @IsOptional()
    year?: number;

    @ApiPropertyOptional({ enum: Town })
    @IsEnum(Town)
    @IsOptional()
    town?: Town;
}
