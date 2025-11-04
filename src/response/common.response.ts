import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponse<T = any> {
	@ApiProperty()
	success: boolean;

	@ApiProperty()
	message: string;

	@ApiProperty()
	data?: T;

	constructor(message: string, data?: T) {
		this.success = true;
		this.message = message;
		this.data = data;
	}
}

export class PaginatedResponse<T> {
	@ApiProperty()
	success: boolean;

	@ApiProperty()
	data: T[];

	@ApiProperty()
	total: number;

	@ApiProperty()
	page: number;

	@ApiProperty()
	limit: number;

	@ApiProperty()
	totalPages: number;

	constructor(data: T[], total: number, page: number, limit: number) {
		this.success = true;
		this.data = data;
		this.total = total;
		this.page = page;
		this.limit = limit;
		this.totalPages = Math.ceil(total / limit);
	}
}
