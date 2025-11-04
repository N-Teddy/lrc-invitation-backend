import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipationReason } from '../common/enums/participation-reason.enum';
import { AttendeeType } from '../request/attendance.request';

export class ParticipantResponse {
	@ApiProperty()
	id: string;

	@ApiProperty()
	childId: string;

	@ApiProperty()
	childFirstName: string;

	@ApiProperty()
	childLastName: string;

	@ApiProperty()
	childAge: number;

	@ApiProperty()
	childAgeGroup: string;

	@ApiProperty()
	parentName: string;

	@ApiPropertyOptional()
	parentEmail?: string;

	@ApiPropertyOptional()
	parentPhone?: string;

	@ApiPropertyOptional()
	parentWhatsapp?: string;

	@ApiProperty()
	meetsRequirements: boolean;

	@ApiProperty({ enum: ParticipationReason })
	reasonForInclusion: ParticipationReason;

	@ApiPropertyOptional()
	notes?: string;

	@ApiProperty()
	invitedAt: Date;

	@ApiPropertyOptional()
	attendanceStatus?: {
		marked: boolean;
		wasPresent?: boolean;
		attendeeType?: AttendeeType;
		attendeeName?: string;
	};
}

export class ParticipantListResponse {
	@ApiProperty()
	activityId: string;

	@ApiProperty()
	activityTitle: string;

	@ApiProperty()
	activityDate: Date;

	@ApiProperty()
	activityLocation?: string;

	@ApiProperty({ type: [ParticipantResponse] })
	participants: ParticipantResponse[];

	@ApiProperty()
	totalParticipants: number;

	@ApiProperty()
	meetingRequirements: number;

	@ApiProperty()
	conditional: number;

	@ApiProperty()
	generatedAt: Date;
}
