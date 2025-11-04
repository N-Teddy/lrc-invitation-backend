import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChildResponse {
	@ApiProperty()
	id: string;

	@ApiProperty()
	firstName: string;

	@ApiProperty()
	lastName: string;

	@ApiProperty()
	dateOfBirth: Date;

	@ApiProperty()
	age: number;

	@ApiProperty()
	currentAgeGroupId: string;

	@ApiProperty()
	currentAgeGroupName: string;

	@ApiProperty()
	townId: string;

	@ApiProperty()
	townName: string;

	@ApiProperty()
	parentName: string;

	@ApiPropertyOptional()
	parentEmail?: string;

	@ApiProperty()
	parentPhone: string;

	@ApiPropertyOptional()
	parentWhatsapp?: string;

	@ApiProperty()
	isActive: boolean;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}
