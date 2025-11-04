import { ParticipationReason } from '../enums/participation-reason.enum';

export interface EligibilityResult {
	eligible: boolean;
	reason: ParticipationReason;
	meetsRequirements: boolean;
	details?: string;
}
