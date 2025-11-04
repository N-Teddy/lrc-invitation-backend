import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../common/enums/role.enum';

export class MonitorResponse {
	@ApiProperty()
	id: string;

	@ApiProperty()
	firstName: string;

	@ApiProperty()
	lastName: string;

	@ApiProperty()
	email: string;

	@ApiProperty()
	phone: string;

	@ApiPropertyOptional()
	whatsappNumber?: string;

	@ApiProperty({ enum: Role })
	role: Role;

	@ApiPropertyOptional()
	townId?: string;

	@ApiPropertyOptional()
	townName?: string;

	@ApiProperty()
	isActive: boolean;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}
