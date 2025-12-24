import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Town } from '../common/enums/activity.enum';
import { NotificationContextType } from '../common/enums/notification.enum';
import { LifecycleStatus, UserRole } from '../common/enums/user.enum';
import {
    formatMonthDay,
    formatMonthYear,
    getDatePartsInTimeZone,
} from '../common/utils/timezone.util';
import { AppConfigService } from '../config/app-config.service';
import { JobRunsService } from '../jobs/job-runs.service';
import { NotificationService } from '../notifications/notifications.service';
import { User, UserDocument } from '../schema/user.schema';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';

const TZ = 'Africa/Douala';

type BirthdayPerson = {
    userId: string;
    fullName: string;
    role: UserRole;
    originTown?: Town;
    dateOfBirth: Date;
};

@Injectable()
export class BirthdaysService {
    private readonly logger = new Logger(BirthdaysService.name);

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly notificationService: NotificationService,
        private readonly recipientsResolver: RecipientsResolverService,
        private readonly jobRuns: JobRunsService,
        private readonly config: AppConfigService,
    ) {}

    async runDaily(now = new Date()) {
        const parts = getDatePartsInTimeZone(now, TZ);
        const dayKey = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(
            parts.day,
        ).padStart(2, '0')}`;

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

    async sendLookahead(days: number, now = new Date()) {
        const upcoming = this.getUpcomingMonthDays(now, days);
        const people = await this.findBirthdays(upcoming);

        const recipients = await this.recipientsResolver.resolve('birthday_7d');
        await this.sendBirthdayMessage(
            recipients,
            `Upcoming birthdays (next ${days} days)`,
            this.renderGroupedByTown(people, { kind: 'lookahead' }),
            `birthday_7d:${upcoming[0]?.month ?? ''}-${upcoming[0]?.day ?? ''}`,
            'birthday-lookahead',
        );
    }

    async sendMonthlyList(now = new Date()) {
        const { month, year } = getDatePartsInTimeZone(now, TZ);
        const people = await this.findBirthdaysForMonth(month);

        const recipients = await this.recipientsResolver.resolve('birthdays_monthly');
        const title = `Birthdays in ${formatMonthYear(now, TZ)}`;
        await this.sendBirthdayMessage(
            recipients,
            title,
            this.renderGroupedByTown(people, { kind: 'monthly' }),
            `birthdays_monthly:${year}-${String(month).padStart(2, '0')}`,
            'birthdays-monthly',
        );
    }

    private async sendBirthdayMessage(
        recipients: Array<{ userId: string; email?: string; phoneE164?: string }>,
        subject: string,
        message: { text: string; html: string },
        contextId: string,
        templateName: string,
    ) {
        const appUrl = this.config.frontendBaseUrl;
        for (const r of recipients) {
            const to = r.email ?? r.phoneE164;
            if (!to) continue;
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
                contextType: NotificationContextType.Birthday,
                contextId,
            });
        }
    }

    private getUpcomingMonthDays(now: Date, days: number) {
        const out: Array<{ month: number; day: number }> = [];
        for (let i = 0; i < days; i += 1) {
            const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
            const parts = getDatePartsInTimeZone(d, TZ);
            out.push({ month: parts.month, day: parts.day });
        }
        return out;
    }

    private async findBirthdays(monthDays: Array<{ month: number; day: number }>) {
        if (!monthDays.length) return [];

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
                lifecycleStatus: LifecycleStatus.Active,
                role: { $in: [UserRole.Child, UserRole.Monitor] },
                dateOfBirth: { $ne: null },
                $or: orExpr,
            })
            .select({ _id: 1, fullName: 1, role: 1, originTown: 1, dateOfBirth: 1 })
            .lean()
            .exec();

        return docs.map((u) => ({
            userId: String(u._id),
            fullName: u.fullName,
            role: u.role as UserRole,
            originTown: u.originTown as Town | undefined,
            dateOfBirth: new Date(u.dateOfBirth),
        })) as BirthdayPerson[];
    }

    private async findBirthdaysForMonth(month: number) {
        const docs = await this.userModel
            .find({
                lifecycleStatus: LifecycleStatus.Active,
                role: { $in: [UserRole.Child, UserRole.Monitor] },
                dateOfBirth: { $ne: null },
                $expr: { $eq: [{ $month: '$dateOfBirth' }, month] },
            })
            .select({ _id: 1, fullName: 1, role: 1, originTown: 1, dateOfBirth: 1 })
            .lean()
            .exec();

        return docs.map((u) => ({
            userId: String(u._id),
            fullName: u.fullName,
            role: u.role as UserRole,
            originTown: u.originTown as Town | undefined,
            dateOfBirth: new Date(u.dateOfBirth),
        })) as BirthdayPerson[];
    }

    private renderGroupedByTown(people: BirthdayPerson[], opts: { kind: 'lookahead' | 'monthly' }) {
        const byTown = new Map<string, BirthdayPerson[]>();
        for (const p of people) {
            const town = p.originTown ?? 'unknown';
            byTown.set(town, [...(byTown.get(town) ?? []), p]);
        }

        const towns = [...byTown.keys()].sort((a, b) => a.localeCompare(b));
        const lines: string[] = [];
        const htmlLines: string[] = [];

        if (!people.length) {
            const empty = 'No birthdays found for this period.';
            return { text: empty, html: `<p>${empty}</p>` };
        }

        for (const town of towns) {
            const list = (byTown.get(town) ?? []).slice().sort((a, b) => {
                const ad = getDatePartsInTimeZone(a.dateOfBirth, TZ);
                const bd = getDatePartsInTimeZone(b.dateOfBirth, TZ);
                if (ad.month !== bd.month) return ad.month - bd.month;
                if (ad.day !== bd.day) return ad.day - bd.day;
                return a.fullName.localeCompare(b.fullName);
            });

            lines.push(`\n${town.toUpperCase()}:`);
            htmlLines.push(`<h3 style="margin:16px 0 8px;">${town.toUpperCase()}</h3>`);

            for (const p of list) {
                const label = `${formatMonthDay(p.dateOfBirth, TZ)} — ${p.fullName} (${p.role})`;
                lines.push(`- ${label}`);
                htmlLines.push(`<div>- ${label}</div>`);
            }
        }

        if (opts.kind === 'monthly') {
            lines.push('\nTip: Use the app for detailed profiles and messaging.');
            htmlLines.push(
                '<p style="margin-top:16px;">Tip: Use the app for detailed profiles and messaging.</p>',
            );
        }

        return { text: lines.join('\n').trim(), html: htmlLines.join('\n') };
    }
}
