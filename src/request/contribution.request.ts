import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsNumber,
	IsPositive,
	IsDateString,
	IsString,
	IsOptional,
} from 'class-validator';

export class RecordPaymentRequest {
	@ApiProperty({ example: 5000 })
	@IsNumber()
	@IsPositive()
	@IsNotEmpty()
	amount: number;

	@ApiProperty({ example: '2024-01-15' })
	@IsDateString()
	@IsNotEmpty()
	paymentDate: string;

	@ApiPropertyOptional({ example: 'First installment' })
	@IsString()
	@IsOptional()
	notes?: string;
}
