import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument, ReminderScheduleType } from '../schema/reminder.schema';
import { User, UserDocument } from '../schema/user.schema';
import { Channel, ReminderKind, ReminderStatus } from '../common/enums/notification.enum';
import { AppConfigService } from '../config/app-config.service';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationContextType } from '../common/enums/notification.enum';
import {
    CreateReminderDto,
    ReminderScheduleDto,
    UpdateReminderDto,
} from '../dtos/request/reminder.dto';
import { computeNextRunAt } from '../common/utils/recurrence.util';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';

@Injectable()
export class RemindersService {
    constructor(
        @InjectModel(Reminder.name) private readonly reminderModel: Model<ReminderDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly config: AppConfigService,
        private readonly notificationService: NotificationService,
    ) {}

    async create(dto: CreateReminderDto, currentUser: Record<string, any>) {
        this.assertCanCreate(currentUser);

        await this.assertRecipientsExist(dto.recipients);

        const schedule = this.normalizeSchedule(dto.schedule);

        const createdByUserId = currentUser?._id ?? currentUser?.id;
        const reminder = await new this.reminderModel({
            kind: ReminderKind.Custom,
            createdByUserId: createdByUserId
                ? new Types.ObjectId(String(createdByUserId))
                : undefined,
            message: dto.message,
            channel: dto.channel ?? Channel.WhatsApp,
            schedule,
            recipients: dto.recipients,
            expectedResponses: dto.expectedResponses ?? [],
            status: ReminderStatus.Draft,
            awaitingAckUserIds: [],
            acknowledgedByUserIds: [],
        }).save();

        return reminder.toObject();
    }

    async list(currentUser: Record<string, any>) {
        const isSuper = this.isSuper(currentUser);
        if (isSuper) {
            return this.reminderModel.find().sort({ createdAt: -1 }).lean().exec();
        }

        const userId = String(currentUser?.id ?? currentUser?._id);
        return this.reminderModel
            .find({
                $or: [{ createdByUserId: new Types.ObjectId(userId) }, { recipients: userId }],
            })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async findOneOrFail(id: string, currentUser: Record<string, any>) {
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder) throw new NotFoundException('Reminder not found');
        this.assertCanRead(reminder, currentUser);
        return reminder;
    }

    async update(id: string, dto: UpdateReminderDto, currentUser: Record<string, any>) {
        this.assertCanCreate(currentUser);

        const existing = await this.reminderModel.findById(id).lean().exec();
        if (!existing) throw new NotFoundException('Reminder not found');
        this.assertCanEdit(existing, currentUser);

        if (![ReminderStatus.Draft, ReminderStatus.Paused].includes(existing.status)) {
            throw new BadRequestException('Only draft/paused reminders can be edited');
        }

        if (dto.recipients) {
            await this.assertRecipientsExist(dto.recipients);
        }

        const update: Record<string, any> = {};
        if (dto.message !== undefined) update.message = dto.message;
        if (dto.channel !== undefined) update.channel = dto.channel;
        if (dto.recipients !== undefined) update.recipients = dto.recipients;
        if (dto.expectedResponses !== undefined) update.expectedResponses = dto.expectedResponses;
        if (dto.schedule !== undefined) update.schedule = this.normalizeSchedule(dto.schedule);

        const updated = await this.reminderModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Reminder not found');
        return updated;
    }

    async activate(id: string, currentUser: Record<string, any>) {
        this.assertCanCreate(currentUser);

        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder) throw new NotFoundException('Reminder not found');
        this.assertCanEdit(reminder, currentUser);

        if (!reminder.schedule?.type) {
            throw new BadRequestException('Reminder schedule is required to activate');
        }

        const now = new Date();
        const nextRunAt = this.computeFirstNextRunAt(reminder.schedule, now);
        if (!nextRunAt) throw new BadRequestException('Unable to compute next run time');

        const updated = await this.reminderModel
            .findByIdAndUpdate(
                id,
                {
                    $set: {
                        status: ReminderStatus.Active,
                        nextRunAt,
                        awaitingAckUserIds: [],
                        acknowledgedByUserIds: [],
                    },
                },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Reminder not found');
        return updated;
    }

    async pause(id: string, currentUser: Record<string, any>) {
        this.assertCanCreate(currentUser);
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder) throw new NotFoundException('Reminder not found');
        this.assertCanEdit(reminder, currentUser);

        const updated = await this.reminderModel
            .findByIdAndUpdate(
                id,
                { $set: { status: ReminderStatus.Paused, nextRunAt: undefined } },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Reminder not found');
        return updated;
    }

    async end(id: string, currentUser: Record<string, any>) {
        this.assertCanCreate(currentUser);
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder) throw new NotFoundException('Reminder not found');
        this.assertCanEdit(reminder, currentUser);

        const updated = await this.reminderModel
            .findByIdAndUpdate(
                id,
                {
                    $set: {
                        status: ReminderStatus.Ended,
                        nextRunAt: undefined,
                        awaitingAckUserIds: [],
                    },
                },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Reminder not found');
        return updated;
    }

    async acknowledge(id: string, currentUser: Record<string, any>) {
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder) throw new NotFoundException('Reminder not found');
        this.assertCanRead(reminder, currentUser);

        const userId = String(currentUser?.id ?? currentUser?._id);
        if (!userId) throw new ForbiddenException('Missing user');

        if (!(reminder.awaitingAckUserIds ?? []).includes(userId)) {
            return reminder;
        }

        const updated = await this.reminderModel
            .findByIdAndUpdate(
                id,
                {
                    $pull: { awaitingAckUserIds: userId },
                    $addToSet: { acknowledgedByUserIds: userId },
                },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Reminder not found');

        if ((updated.awaitingAckUserIds ?? []).length > 0) {
            return updated;
        }

        // Everyone acknowledged: close one-time reminders; compute next run for recurring reminders.
        if (updated.schedule?.type === ReminderScheduleType.Once || !updated.schedule?.type) {
            return this.reminderModel
                .findByIdAndUpdate(
                    id,
                    {
                        $set: { status: ReminderStatus.Ended, nextRunAt: undefined },
                    },
                    { new: true },
                )
                .lean()
                .exec();
        }

        const base = updated.lastSentAt ? new Date(updated.lastSentAt) : new Date();
        const nextRunAt = computeNextRunAt(updated.schedule as any, base);
        return this.reminderModel
            .findByIdAndUpdate(
                id,
                {
                    $set: {
                        nextRunAt,
                        acknowledgedByUserIds: [],
                    },
                },
                { new: true },
            )
            .lean()
            .exec();
    }

    async processDueReminders(now = new Date()) {
        const due = await this.reminderModel
            .find({
                status: ReminderStatus.Active,
                nextRunAt: { $ne: null, $lte: now },
                awaitingAckUserIds: { $size: 0 },
                kind: ReminderKind.Custom,
            })
            .lean()
            .exec();

        for (const reminder of due) {
            await this.sendReminder(reminder, now);
        }
    }

    private async sendReminder(reminder: Record<string, any>, now: Date) {
        const recipients = reminder.recipients ?? [];
        if (!recipients.length) {
            await this.reminderModel.findByIdAndUpdate(reminder._id, {
                $set: { lastSentAt: now, nextRunAt: undefined, status: ReminderStatus.Ended },
            });
            return;
        }

        const users = await this.userModel
            .find({ _id: { $in: recipients.map((id: string) => new Types.ObjectId(id)) } })
            .lean()
            .exec();
        const userById = new Map<string, Record<string, any>>();
        for (const u of users) userById.set(String(u._id), u);

        const sentTo: string[] = [];
        const subject = 'Reminder';

        for (const userId of recipients) {
            const u = userById.get(userId);
            if (!u) continue;

            const to = this.resolveTo(u);
            if (!to) continue;

            await this.notificationService.send({
                userId: String(u._id),
                to,
                subject,
                message: reminder.message,
                templateName: 'generic-notification',
                templateData: {
                    subject,
                    headline: subject,
                    message: reminder.message,
                },
                contextType: NotificationContextType.Reminder,
                contextId: String(reminder._id),
            });
            sentTo.push(String(u._id));
        }

        await this.reminderModel.findByIdAndUpdate(reminder._id, {
            $set: {
                lastSentAt: now,
                nextRunAt: undefined,
                awaitingAckUserIds: sentTo,
                acknowledgedByUserIds: [],
                status: ReminderStatus.Active,
                channel:
                    this.config.notificationProvider === 'whatsapp'
                        ? Channel.WhatsApp
                        : Channel.Email,
            },
        });
    }

    private resolveTo(user: Record<string, any>) {
        if (this.config.notificationProvider === 'whatsapp') {
            if (user.whatsApp?.optIn === false) return undefined;
            return user.whatsApp?.phoneE164 as string | undefined;
        }
        return user.email as string | undefined;
    }

    private normalizeSchedule(dto?: ReminderScheduleDto) {
        if (!dto) return undefined;
        const schedule: any = { type: dto.type };
        if (dto.runAt) schedule.runAt = new Date(dto.runAt);
        if (dto.intervalMinutes !== undefined) schedule.intervalMinutes = dto.intervalMinutes;
        if (dto.hour !== undefined) schedule.hour = dto.hour;
        if (dto.minute !== undefined) schedule.minute = dto.minute;
        if (dto.dayOfWeek !== undefined) schedule.dayOfWeek = dto.dayOfWeek;
        if (dto.dayOfMonth !== undefined) schedule.dayOfMonth = dto.dayOfMonth;
        return schedule;
    }

    private computeFirstNextRunAt(schedule: any, now: Date) {
        if (schedule.type === ReminderScheduleType.Once) {
            const runAt = schedule.runAt ? new Date(schedule.runAt) : undefined;
            if (!runAt) return undefined;
            return runAt.getTime() <= now.getTime() ? now : runAt;
        }
        return computeNextRunAt(schedule, now);
    }

    private async assertRecipientsExist(userIds: string[]) {
        const unique = [...new Set(userIds)];
        const count = await this.userModel
            .countDocuments({ _id: { $in: unique.map((id) => new Types.ObjectId(id)) } })
            .exec();
        if (count !== unique.length) {
            throw new BadRequestException('One or more recipients not found');
        }
    }

    private assertCanRead(reminder: Record<string, any>, currentUser: Record<string, any>) {
        if (this.isSuper(currentUser)) return;
        const userId = String(currentUser?.id ?? currentUser?._id);
        if (!userId) throw new ForbiddenException('Missing user');

        const createdBy = reminder.createdByUserId ? String(reminder.createdByUserId) : undefined;
        const can = createdBy === userId || (reminder.recipients ?? []).includes(userId);
        if (!can) throw new ForbiddenException('Not allowed');
    }

    private assertCanEdit(reminder: Record<string, any>, currentUser: Record<string, any>) {
        if (this.isSuper(currentUser)) return;
        const userId = String(currentUser?.id ?? currentUser?._id);
        const createdBy = reminder.createdByUserId ? String(reminder.createdByUserId) : undefined;
        if (!userId || createdBy !== userId) throw new ForbiddenException('Not allowed');
    }

    private assertCanCreate(currentUser: Record<string, any>) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can manage reminders');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Aspiring) {
            throw new ForbiddenException('Aspiring monitors cannot manage reminders');
        }
    }

    private isSuper(currentUser: Record<string, any>) {
        return (
            currentUser?.role === UserRole.Monitor &&
            currentUser?.monitorLevel === MonitorLevel.Super
        );
    }
}
