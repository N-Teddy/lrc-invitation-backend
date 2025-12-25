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
var BirthdaysService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BirthdaysService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_enum_1 = require("../common/enums/notification.enum");
const user_enum_1 = require("../common/enums/user.enum");
const timezone_util_1 = require("../common/utils/timezone.util");
const app_config_service_1 = require("../config/app-config.service");
const job_runs_service_1 = require("../jobs/job-runs.service");
const notifications_service_1 = require("../notifications/notifications.service");
const user_schema_1 = require("../schema/user.schema");
const recipients_resolver_service_1 = require("../common/services/recipients-resolver.service");
const TZ = 'Africa/Douala';
let BirthdaysService = BirthdaysService_1 = class BirthdaysService {
    constructor(userModel, notificationService, recipientsResolver, jobRuns, config) {
        this.userModel = userModel;
        this.notificationService = notificationService;
        this.recipientsResolver = recipientsResolver;
        this.jobRuns = jobRuns;
        this.config = config;
        this.logger = new common_1.Logger(BirthdaysService_1.name);
    }
    async runDaily(now = new Date()) {
        const parts = (0, timezone_util_1.getDatePartsInTimeZone)(now, TZ);
        const dayKey = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
        const shouldRunDaily = await this.jobRuns.tryStart('birthday_7d', dayKey, {
            timeZone: TZ,
        });
        if (shouldRunDaily) {
            await this.sendLookahead(7, now);
        }
        if (parts.day === 1) {
            const monthKey = `${parts.year}-${String(parts.month).padStart(2, '0')}`;
            const shouldRunMonthly = await this.jobRuns.tryStart('birthdays_monthly', monthKey, {
                timeZone: TZ,
            });
            if (shouldRunMonthly) {
                await this.sendMonthlyList(now);
            }
        }
    }
    async sendLookahead(days, now = new Date()) {
        const upcoming = this.getUpcomingMonthDays(now, days);
        const people = await this.findBirthdays(upcoming);
        const recipients = await this.recipientsResolver.resolve('birthday_7d');
        await this.sendBirthdayMessage(recipients, `Upcoming birthdays (next ${days} days)`, this.renderGroupedByTown(people, { kind: 'lookahead' }), `birthday_7d:${upcoming[0]?.month ?? ''}-${upcoming[0]?.day ?? ''}`, 'birthday-lookahead');
    }
    async sendMonthlyList(now = new Date()) {
        const { month, year } = (0, timezone_util_1.getDatePartsInTimeZone)(now, TZ);
        const people = await this.findBirthdaysForMonth(month);
        const recipients = await this.recipientsResolver.resolve('birthdays_monthly');
        const title = `Birthdays in ${(0, timezone_util_1.formatMonthYear)(now, TZ)}`;
        await this.sendBirthdayMessage(recipients, title, this.renderGroupedByTown(people, { kind: 'monthly' }), `birthdays_monthly:${year}-${String(month).padStart(2, '0')}`, 'birthdays-monthly');
    }
    async sendBirthdayMessage(recipients, subject, message, contextId, templateName) {
        const appUrl = this.config.frontendBaseUrl;
        for (const r of recipients) {
            const to = r.email ?? r.phoneE164;
            if (!to)
                continue;
            await this.notificationService.send({
                userId: r.userId,
                to,
                subject,
                message: message.text,
                templateName,
                templateData: {
                    subject,
                    headline: subject,
                    bodyHtml: message.html,
                    appUrl,
                },
                contextType: notification_enum_1.NotificationContextType.Birthday,
                contextId,
            });
        }
    }
    getUpcomingMonthDays(now, days) {
        const out = [];
        for (let i = 0; i < days; i += 1) {
            const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
            const parts = (0, timezone_util_1.getDatePartsInTimeZone)(d, TZ);
            out.push({ month: parts.month, day: parts.day });
        }
        return out;
    }
    async findBirthdays(monthDays) {
        if (!monthDays.length)
            return [];
        const orExpr = monthDays.map(({ month, day }) => ({
            $expr: {
                $and: [
                    { $eq: [{ $month: '$dateOfBirth' }, month] },
                    { $eq: [{ $dayOfMonth: '$dateOfBirth' }, day] },
                ],
            },
        }));
        const docs = await this.userModel
            .find({
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
            role: { $in: [user_enum_1.UserRole.Child, user_enum_1.UserRole.Monitor] },
            dateOfBirth: { $ne: null },
            $or: orExpr,
        })
            .select({ _id: 1, fullName: 1, role: 1, originTown: 1, dateOfBirth: 1 })
            .lean()
            .exec();
        return docs.map((u) => ({
            userId: String(u._id),
            fullName: u.fullName,
            role: u.role,
            originTown: u.originTown,
            dateOfBirth: new Date(u.dateOfBirth),
        }));
    }
    async findBirthdaysForMonth(month) {
        const docs = await this.userModel
            .find({
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
            role: { $in: [user_enum_1.UserRole.Child, user_enum_1.UserRole.Monitor] },
            dateOfBirth: { $ne: null },
            $expr: { $eq: [{ $month: '$dateOfBirth' }, month] },
        })
            .select({ _id: 1, fullName: 1, role: 1, originTown: 1, dateOfBirth: 1 })
            .lean()
            .exec();
        return docs.map((u) => ({
            userId: String(u._id),
            fullName: u.fullName,
            role: u.role,
            originTown: u.originTown,
            dateOfBirth: new Date(u.dateOfBirth),
        }));
    }
    renderGroupedByTown(people, opts) {
        const byTown = new Map();
        for (const p of people) {
            const town = p.originTown ?? 'unknown';
            byTown.set(town, [...(byTown.get(town) ?? []), p]);
        }
        const towns = [...byTown.keys()].sort((a, b) => a.localeCompare(b));
        const lines = [];
        const htmlLines = [];
        if (!people.length) {
            const empty = 'No birthdays found for this period.';
            return { text: empty, html: `<p>${empty}</p>` };
        }
        for (const town of towns) {
            const list = (byTown.get(town) ?? []).slice().sort((a, b) => {
                const ad = (0, timezone_util_1.getDatePartsInTimeZone)(a.dateOfBirth, TZ);
                const bd = (0, timezone_util_1.getDatePartsInTimeZone)(b.dateOfBirth, TZ);
                if (ad.month !== bd.month)
                    return ad.month - bd.month;
                if (ad.day !== bd.day)
                    return ad.day - bd.day;
                return a.fullName.localeCompare(b.fullName);
            });
            lines.push(`\n${town.toUpperCase()}:`);
            htmlLines.push(`<h3 style="margin:16px 0 8px;">${town.toUpperCase()}</h3>`);
            for (const p of list) {
                const label = `${(0, timezone_util_1.formatMonthDay)(p.dateOfBirth, TZ)} — ${p.fullName} (${p.role})`;
                lines.push(`- ${label}`);
                htmlLines.push(`<div>- ${label}</div>`);
            }
        }
        if (opts.kind === 'monthly') {
            lines.push('\nTip: Use the app for detailed profiles and messaging.');
            htmlLines.push('<p style="margin-top:16px;">Tip: Use the app for detailed profiles and messaging.</p>');
        }
        return { text: lines.join('\n').trim(), html: htmlLines.join('\n') };
    }
};
exports.BirthdaysService = BirthdaysService;
exports.BirthdaysService = BirthdaysService = BirthdaysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_service_1.NotificationService,
        recipients_resolver_service_1.RecipientsResolverService,
        job_runs_service_1.JobRunsService,
        app_config_service_1.AppConfigService])
], BirthdaysService);
//# sourceMappingURL=birthdays.service.js.map