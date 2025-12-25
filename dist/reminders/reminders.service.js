"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const reminder_schema_1 = require("../schema/reminder.schema");
const user_schema_1 = require("../schema/user.schema");
const notification_enum_1 = require("../common/enums/notification.enum");
const app_config_service_1 = require("../config/app-config.service");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_enum_2 = require("../common/enums/notification.enum");
const recurrence_util_1 = require("../common/utils/recurrence.util");
const user_enum_1 = require("../common/enums/user.enum");
const timezone_util_1 = require("../common/utils/timezone.util");
const town_scope_service_1 = require("../common/services/town-scope.service");
const interaction_event_schema_1 = require("../schema/interaction-event.schema");
const TZ = 'Africa/Douala';
let RemindersService = class RemindersService {
    constructor(reminderModel, userModel, interactionEventModel, townScopeService, config, notificationService) {
        this.reminderModel = reminderModel;
        this.userModel = userModel;
        this.interactionEventModel = interactionEventModel;
        this.townScopeService = townScopeService;
        this.config = config;
        this.notificationService = notificationService;
    }
    async create(dto, currentUser) {
        this.assertCanCreate(currentUser);
        await this.assertRecipientsAreTownMonitors(dto.recipients, currentUser);
        const schedule = this.normalizeSchedule(dto.schedule);
        const createdByUserId = currentUser?._id ?? currentUser?.id;
        const reminder = await new this.reminderModel({
            kind: notification_enum_1.ReminderKind.Custom,
            createdByUserId: createdByUserId
                ? new mongoose_2.Types.ObjectId(String(createdByUserId))
                : undefined,
            message: dto.message,
            channel: this.config.notificationProvider === 'whatsapp' ? notification_enum_1.Channel.WhatsApp : notification_enum_1.Channel.Email,
            schedule,
            recipients: dto.recipients,
            expectedResponses: dto.expectedResponses ?? [],
            status: notification_enum_1.ReminderStatus.Draft,
            awaitingAckUserIds: [],
            acknowledgedByUserIds: [],
        }).save();
        return reminder.toObject();
    }
    async list(currentUser) {
        const isSuper = this.isSuper(currentUser);
        if (isSuper) {
            return this.reminderModel.find().sort({ createdAt: -1 }).lean().exec();
        }
        const userId = String(currentUser?.id ?? currentUser?._id);
        return this.reminderModel
            .find({
            $or: [{ createdByUserId: new mongoose_2.Types.ObjectId(userId) }, { recipients: userId }],
        })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async findOneOrFail(id, currentUser) {
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder)
            throw new common_1.NotFoundException('Reminder not found');
        this.assertCanRead(reminder, currentUser);
        return reminder;
    }
    async update(id, dto, currentUser) {
        this.assertCanCreate(currentUser);
        const existing = await this.reminderModel.findById(id).lean().exec();
        if (!existing)
            throw new common_1.NotFoundException('Reminder not found');
        this.assertCanEdit(existing, currentUser);
        if (![notification_enum_1.ReminderStatus.Draft, notification_enum_1.ReminderStatus.Paused].includes(existing.status)) {
            throw new common_1.BadRequestException('Only draft/paused reminders can be edited');
        }
        if (dto.recipients) {
            await this.assertRecipientsAreTownMonitors(dto.recipients, currentUser);
        }
        const update = {};
        if (dto.message !== undefined)
            update.message = dto.message;
        if (dto.recipients !== undefined)
            update.recipients = dto.recipients;
        if (dto.expectedResponses !== undefined)
            update.expectedResponses = dto.expectedResponses;
        if (dto.schedule !== undefined)
            update.schedule = this.normalizeSchedule(dto.schedule);
        const updated = await this.reminderModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Reminder not found');
        return updated;
    }
    async activate(id, currentUser) {
        this.assertCanCreate(currentUser);
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder)
            throw new common_1.NotFoundException('Reminder not found');
        this.assertCanEdit(reminder, currentUser);
        if (!reminder.schedule?.type) {
            throw new common_1.BadRequestException('Reminder schedule is required to activate');
        }
        const now = new Date();
        const nextRunAt = this.computeFirstNextRunAt(reminder.schedule, now);
        if (!nextRunAt)
            throw new common_1.BadRequestException('Unable to compute next run time');
        const updated = await this.reminderModel
            .findByIdAndUpdate(id, {
            $set: {
                status: notification_enum_1.ReminderStatus.Active,
                nextRunAt,
                awaitingAckUserIds: [],
                acknowledgedByUserIds: [],
            },
        }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Reminder not found');
        return updated;
    }
    async pause(id, currentUser) {
        this.assertCanCreate(currentUser);
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder)
            throw new common_1.NotFoundException('Reminder not found');
        this.assertCanEdit(reminder, currentUser);
        const updated = await this.reminderModel
            .findByIdAndUpdate(id, { $set: { status: notification_enum_1.ReminderStatus.Paused, nextRunAt: undefined } }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Reminder not found');
        return updated;
    }
    async end(id, currentUser) {
        this.assertCanCreate(currentUser);
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder)
            throw new common_1.NotFoundException('Reminder not found');
        this.assertCanEdit(reminder, currentUser);
        const updated = await this.reminderModel
            .findByIdAndUpdate(id, {
            $set: {
                status: notification_enum_1.ReminderStatus.Ended,
                nextRunAt: undefined,
                awaitingAckUserIds: [],
            },
        }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Reminder not found');
        return updated;
    }
    async acknowledge(id, currentUser) {
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder)
            throw new common_1.NotFoundException('Reminder not found');
        this.assertCanRead(reminder, currentUser);
        const userId = String(currentUser?.id ?? currentUser?._id);
        if (!userId)
            throw new common_1.ForbiddenException('Missing user');
        if (!(reminder.awaitingAckUserIds ?? []).includes(userId)) {
            return reminder;
        }
        await this.interactionEventModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            contextType: reminder.kind === notification_enum_1.ReminderKind.GroupChange
                ? notification_enum_2.NotificationContextType.GroupChange
                : notification_enum_2.NotificationContextType.Reminder,
            contextId: String(reminder._id),
            actionId: 'ACK',
        });
        const updated = await this.reminderModel
            .findByIdAndUpdate(id, {
            $pull: { awaitingAckUserIds: userId },
            $addToSet: { acknowledgedByUserIds: userId },
        }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Reminder not found');
        if ((updated.awaitingAckUserIds ?? []).length > 0) {
            return updated;
        }
        if (updated.schedule?.type === reminder_schema_1.ReminderScheduleType.Once || !updated.schedule?.type) {
            return this.reminderModel
                .findByIdAndUpdate(id, {
                $set: { status: notification_enum_1.ReminderStatus.Ended, nextRunAt: undefined },
            }, { new: true })
                .lean()
                .exec();
        }
        const base = updated.lastSentAt ? new Date(updated.lastSentAt) : new Date();
        const nextRunAt = (0, recurrence_util_1.computeNextRunAt)(updated.schedule, base);
        return this.reminderModel
            .findByIdAndUpdate(id, {
            $set: {
                nextRunAt,
                acknowledgedByUserIds: [],
            },
        }, { new: true })
            .lean()
            .exec();
    }
    async respond(id, dto, currentUser) {
        const reminder = await this.reminderModel.findById(id).lean().exec();
        if (!reminder)
            throw new common_1.NotFoundException('Reminder not found');
        this.assertCanRead(reminder, currentUser);
        const userId = String(currentUser?.id ?? currentUser?._id);
        if (!userId)
            throw new common_1.ForbiddenException('Missing user');
        const value = String(dto.value ?? '').trim();
        if (!value)
            throw new common_1.BadRequestException('value is required');
        const allowed = new Set((reminder.expectedResponses ?? []).map((r) => String(r.value)));
        if (!allowed.size) {
            throw new common_1.BadRequestException('This reminder has no response options');
        }
        if (!allowed.has(value)) {
            throw new common_1.BadRequestException('Invalid response value');
        }
        if (!(reminder.awaitingAckUserIds ?? []).includes(userId)) {
            return reminder;
        }
        await this.interactionEventModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            contextType: reminder.kind === notification_enum_1.ReminderKind.GroupChange
                ? notification_enum_2.NotificationContextType.GroupChange
                : notification_enum_2.NotificationContextType.Reminder,
            contextId: String(reminder._id),
            actionId: `RESP:${value}`,
            meta: { value },
        });
        const updated = await this.reminderModel
            .findByIdAndUpdate(id, {
            $pull: { awaitingAckUserIds: userId },
            $addToSet: { acknowledgedByUserIds: userId },
        }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Reminder not found');
        if ((updated.awaitingAckUserIds ?? []).length > 0) {
            return updated;
        }
        if (updated.schedule?.type === reminder_schema_1.ReminderScheduleType.Once || !updated.schedule?.type) {
            return this.reminderModel
                .findByIdAndUpdate(id, {
                $set: { status: notification_enum_1.ReminderStatus.Ended, nextRunAt: undefined },
            }, { new: true })
                .lean()
                .exec();
        }
        const base = updated.lastSentAt ? new Date(updated.lastSentAt) : new Date();
        const nextRunAt = (0, recurrence_util_1.computeNextRunAt)(updated.schedule, base);
        return this.reminderModel
            .findByIdAndUpdate(id, {
            $set: {
                nextRunAt,
                acknowledgedByUserIds: [],
            },
        }, { new: true })
            .lean()
            .exec();
    }
    async processDueReminders(now = new Date()) {
        const due = await this.reminderModel
            .find({
            status: notification_enum_1.ReminderStatus.Active,
            nextRunAt: { $ne: null, $lte: now },
            awaitingAckUserIds: { $size: 0 },
            kind: notification_enum_1.ReminderKind.Custom,
        })
            .lean()
            .exec();
        for (const reminder of due) {
            await this.sendReminder(reminder, now);
        }
    }
    async sendReminder(reminder, now) {
        const recipients = reminder.recipients ?? [];
        if (!recipients.length) {
            await this.reminderModel.findByIdAndUpdate(reminder._id, {
                $set: { lastSentAt: now, nextRunAt: undefined, status: notification_enum_1.ReminderStatus.Ended },
            });
            return;
        }
        const users = await this.userModel
            .find({ _id: { $in: recipients.map((id) => new mongoose_2.Types.ObjectId(id)) } })
            .lean()
            .exec();
        const userById = new Map();
        for (const u of users)
            userById.set(String(u._id), u);
        const sentTo = [];
        const subject = 'Reminder';
        const runAtForExpiry = reminder.nextRunAt ? new Date(reminder.nextRunAt) : now;
        const expiresAt = (0, timezone_util_1.endOfDayInTimeZone)(runAtForExpiry, TZ);
        for (const userId of recipients) {
            const u = userById.get(userId);
            if (!u)
                continue;
            const to = this.resolveTo(u);
            if (!to)
                continue;
            const baseRedirect = this.config.frontendBaseUrl;
            const reminderUrl = `${baseRedirect}/reminders/${String(reminder._id)}`;
            const actions = [
                { id: 'ACK', label: 'Acknowledge', redirectUrl: reminderUrl },
                { id: 'DETAILS', label: 'View details', redirectUrl: reminderUrl },
                ...(reminder.expectedResponses ?? []).map((r) => ({
                    id: `RESP:${String(r.value)}`,
                    label: String(r.label ?? r.value ?? 'Respond'),
                    redirectUrl: reminderUrl,
                })),
            ];
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
                actions,
                conversation: {
                    state: 'reminder',
                    allowedResponses: actions.map((a) => a.id),
                    expiresAt,
                },
                contextType: notification_enum_2.NotificationContextType.Reminder,
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
                status: notification_enum_1.ReminderStatus.Active,
                channel: this.config.notificationProvider === 'whatsapp'
                    ? notification_enum_1.Channel.WhatsApp
                    : notification_enum_1.Channel.Email,
            },
        });
    }
    resolveTo(user) {
        if (this.config.notificationProvider === 'whatsapp') {
            if (user.whatsApp?.optIn === false)
                return undefined;
            return user.whatsApp?.phoneE164;
        }
        return user.email;
    }
    normalizeSchedule(dto) {
        if (!dto)
            return undefined;
        const schedule = { type: dto.type };
        if (dto.runAt)
            schedule.runAt = new Date(dto.runAt);
        if (dto.intervalMinutes !== undefined)
            schedule.intervalMinutes = dto.intervalMinutes;
        if (dto.hour !== undefined)
            schedule.hour = dto.hour;
        if (dto.minute !== undefined)
            schedule.minute = dto.minute;
        if (dto.dayOfWeek !== undefined)
            schedule.dayOfWeek = dto.dayOfWeek;
        if (dto.dayOfMonth !== undefined)
            schedule.dayOfMonth = dto.dayOfMonth;
        return schedule;
    }
    computeFirstNextRunAt(schedule, now) {
        if (schedule.type === reminder_schema_1.ReminderScheduleType.Once) {
            const runAt = schedule.runAt ? new Date(schedule.runAt) : undefined;
            if (!runAt)
                return undefined;
            return runAt.getTime() <= now.getTime() ? now : runAt;
        }
        return (0, recurrence_util_1.computeNextRunAt)(schedule, now);
    }
    async assertRecipientsAreTownMonitors(userIds, currentUser) {
        const town = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!town)
            throw new common_1.ForbiddenException('Monitor town not set');
        const unique = [...new Set(userIds)];
        const count = await this.userModel
            .countDocuments({
            _id: { $in: unique.map((id) => new mongoose_2.Types.ObjectId(id)) },
            role: user_enum_1.UserRole.Monitor,
            originTown: town,
        })
            .exec();
        if (count !== unique.length) {
            throw new common_1.BadRequestException('Recipients must be monitors in your town');
        }
    }
    assertCanRead(reminder, currentUser) {
        if (this.isSuper(currentUser))
            return;
        const userId = String(currentUser?.id ?? currentUser?._id);
        if (!userId)
            throw new common_1.ForbiddenException('Missing user');
        const createdBy = reminder.createdByUserId ? String(reminder.createdByUserId) : undefined;
        const can = createdBy === userId || (reminder.recipients ?? []).includes(userId);
        if (!can)
            throw new common_1.ForbiddenException('Not allowed');
    }
    assertCanEdit(reminder, currentUser) {
        if (this.isSuper(currentUser))
            return;
        const userId = String(currentUser?.id ?? currentUser?._id);
        const createdBy = reminder.createdByUserId ? String(reminder.createdByUserId) : undefined;
        if (!userId || createdBy !== userId)
            throw new common_1.ForbiddenException('Not allowed');
    }
    assertCanCreate(currentUser) {
        if (currentUser?.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.ForbiddenException('Only monitors can manage reminders');
        }
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Aspiring) {
            throw new common_1.ForbiddenException('Aspiring monitors cannot manage reminders');
        }
    }
    isSuper(currentUser) {
        return (currentUser?.role === user_enum_1.UserRole.Monitor &&
            currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super);
    }
};
exports.RemindersService = RemindersService;
exports.RemindersService = RemindersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reminder_schema_1.Reminder.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(interaction_event_schema_1.InteractionEvent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        town_scope_service_1.TownScopeService,
        app_config_service_1.AppConfigService,
        notifications_service_1.NotificationService])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map