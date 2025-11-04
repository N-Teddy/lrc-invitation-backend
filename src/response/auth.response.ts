import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../common/enums/role.enum';

export class AuthResponse {
	@ApiProperty()
	accessToken: string;

	@ApiProperty()
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		role: Role;
		townId?: string;
	};

	constructor(accessToken: string, user: any) {
		this.accessToken = accessToken;
		this.user = {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			townId: user.townId,
		};
	}
}
