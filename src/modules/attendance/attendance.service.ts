import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';
import { Activity } from '../../entities/activity.entity';
import { Monitor } from '../../entities/monitor.entity';
import { MarkAttendanceRequest, UpdateAttendanceRequest } from '../../request/attendance.request';
import { BusinessException } from '../../common/exceptions/business.exception';
import { NotificationService } from '../notification/notification.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AttendanceService {
	constructor(
		@InjectRepository(Attendance)
		private attendanceRepository: Repository<Attendance>,
		@InjectRepository(Activity)
		private activityRepository: Repository<Activity>,
		@InjectRepository(Monitor)
		private monitorRepository: Repository<Monitor>,
		private notificationService: NotificationService
	) {}

	async markAttendance(
		activityId: string,
		monitorId: string,
		markRequest: MarkAttendanceRequest
	): Promise<void> {
		const activity = await this.activityRepository.findOne({
			where: { id: activityId },
		});

		if (!activity) {
			throw new BusinessException('Activity not found');
		}

		const attendanceRecords = markRequest.records.map((record) =>
			this.attendanceRepository.create({
				activityId,
				childId: record.childId,
				wasPresent: record.wasPresent,
				attendeeType: record.attendeeType,
				attendeeName: record.attendeeName,
				markedByMonitorId: monitorId,
			})
		);

		await this.attendanceRepository.save(attendanceRecords);
	}

	async getAttendance(activityId: string): Promise<Attendance[]> {
		return this.attendanceRepository.find({
			where: { activityId },
			relations: ['child', 'child.currentAgeGroup', 'markedBy'],
			order: { markedAt: 'DESC' },
		});
	}

	async updateAttendance(
		attendanceId: string,
		monitorId: string,
		updateRequest: UpdateAttendanceRequest
	): Promise<Attendance> {
		const attendance = await this.attendanceRepository.findOne({
			where: { id: attendanceId },
			relations: ['activity', 'child'],
		});

		if (!attendance) {
			throw new BusinessException('Attendance record not found');
		}

		const previousState = { ...attendance };

		attendance.wasPresent = updateRequest.wasPresent;
		if (updateRequest.attendeeType) {
			attendance.attendeeType = updateRequest.attendeeType;
		}
		if (updateRequest.attendeeName) {
			attendance.attendeeName = updateRequest.attendeeName;
		}
		attendance.edited = true;
		attendance.editReason = `Updated by monitor ${monitorId}`;

		const updated = await this.attendanceRepository.save(attendance);

		// Notify super monitor about the edit
		await this.notifyAttendanceEdit(updated, previousState, monitorId);

		return updated;
	}

	private async notifyAttendanceEdit(
		attendance: Attendance,
		previousState: any,
		editorId: string
	): Promise<void> {
		const superMonitors = await this.monitorRepository.find({
			where: { role: Role.SUPER_MONITOR, isActive: true },
		});

		const editor = await this.monitorRepository.findOne({
			where: { id: editorId },
		});

		const message = `
      Attendance record edited:
      Activity: ${attendance.activity.title}
      Child: ${attendance.child.firstName} ${attendance.child.lastName}
      Previous Status: ${previousState.wasPresent ? 'Present' : 'Absent'}
      New Status: ${attendance.wasPresent ? 'Present' : 'Absent'}
      Edited by: ${editor.firstName} ${editor.lastName}
    `;

		for (const superMonitor of superMonitors) {
			await this.notificationService.sendAttendanceEditNotification(superMonitor, message);
		}
	}
}
