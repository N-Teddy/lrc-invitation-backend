import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../common/enums/activity-type.enum';

export class ActivityResponse {
	@ApiProperty()
	id: string;

	@ApiProperty()
	title: string;

	@ApiProperty({ enum: ActivityType })
	activityType: ActivityType;

	@ApiProperty()
	townId: string;

	@ApiProperty()
	townName: string;

	@ApiProperty()
	startDate: Date;

	@ApiProperty()
	endDate: Date;

	@ApiPropertyOptional()
	location?: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiProperty()
	participantListGenerated: boolean;

	@ApiPropertyOptional()
	participantListGeneratedAt?: Date;

	@ApiProperty({ type: [String] })
	targetGroupIds: string[];

	@ApiProperty({ type: [String] })
	targetGroupNames: string[];

	@ApiProperty()
	participantCount?: number;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}
