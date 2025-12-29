import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TownScopeService } from '../common/services/town-scope.service';
import { MediaService } from '../media/media.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationService } from '../notifications/notifications.service';
import { AppConfigService } from '../config/app-config.service';
import { User, UserDocument } from '../schema/user.schema';
import { ChildProfile, ChildProfileDocument } from '../schema/child-profile.schema';
import { CreateChildDto } from '../dtos/request/child.dto';
import { ActivityType, ChildGroup, Town } from '../common/enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { computeGroupFromAge } from '../common/utils/age-group.util';
import { computeAgeYears } from '../common/utils/groups.util';
import { NotificationContextType } from '../common/enums/notification.enum';
import { UsersService } from '../users/users.service';
import { UploadedFile } from '../common/interfaces/uploaded-file.interface';
import { Attendance, AttendanceDocument } from '../schema/attendance.schema';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { AttendanceRoleAtTime } from '../common/enums/attendance.enum';

type GuardianInput = { fullName: string; phoneE164: string; relationship: string; email?: string };
type CreateChildMultipartInput = {
    fullName: string;
    dateOfBirth: string;
    guardiansJson: string;
    preferredLanguage?: string;
    whatsAppPhoneE164?: string;
    whatsAppOptIn?: boolean;
};

@Injectable()
export class ChildrenService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(ChildProfile.name)
        private readonly childProfileModel: Model<ChildProfileDocument>,
        @InjectModel(Attendance.name)
        private readonly attendanceModel: Model<AttendanceDocument>,
        @InjectModel(Activity.name)
        private readonly activityModel: Model<ActivityDocument>,
        private readonly townScopeService: TownScopeService,
        private readonly settingsService: SettingsService,
        private readonly mediaService: MediaService,
        private readonly notificationService: NotificationService,
        private readonly usersService: UsersService,
        private readonly config: AppConfigService,
    ) {}

    async list(
        filters: {
            q?: string;
            group?: ChildGroup;
            includeArchived?: boolean;
            page?: number;
            limit?: number;
        },
        currentUser: Record<string, any>,
    ): Promise<{
        items: any[];
        page: number;
        limit: number;
        total: number;
        missingProfileImageCount: number;
    }> {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;

        const q = (filters.q ?? '').trim();
        const includeArchived = !!filters.includeArchived && isSuper;

        const limit = Number.isFinite(filters.limit)
            ? Math.max(1, Math.min(50, Math.floor(filters.limit as number)))
            : 20;
        const page = Number.isFinite(filters.page)
            ? Math.max(1, Math.floor(filters.page as number))
            : 1;
        const skip = (page - 1) * limit;

        const query: Record<string, any> = { role: UserRole.Child };
        if (!includeArchived) query.lifecycleStatus = LifecycleStatus.Active;
        if (!isSuper) query.originTown = scopeTown;
        if (q.length >= 2) {
            query.fullName = {
                $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                $options: 'i',
            };
        }

        const group = filters.group as ChildGroup | undefined;
        if (group) {
            if (!Object.values(ChildGroup).includes(group)) {
                throw new BadRequestException('Invalid group');
            }
            const matches = await this.childProfileModel
                .find({ currentGroup: group })
                .select({ userId: 1 })
                .lean()
                .exec();
            const ids = matches.map((m: any) => m.userId).filter(Boolean);
            if (!ids.length) {
                return { items: [], page, limit, total: 0, missingProfileImageCount: 0 };
            }
            query._id = { $in: ids };
        }

        const [total, missingProfileImageCount, users] = await Promise.all([
            this.userModel.countDocuments(query).exec(),
            this.userModel
                .countDocuments({
                    ...query,
                    $or: [
                        { profileImage: { $exists: false } },
                        { 'profileImage.url': { $exists: false } },
                        { 'profileImage.url': null },
                        { 'profileImage.url': '' },
                    ],
                })
                .exec(),
            this.userModel.find(query).sort({ fullName: 1 }).skip(skip).limit(limit).lean().exec(),
        ]);

        if (!users.length) {
            return { items: [], page, limit, total, missingProfileImageCount };
        }

        const ids = users.map((u) => u._id);
        const profiles = await this.childProfileModel
            .find({ userId: { $in: ids } })
            .select({ userId: 1, currentGroup: 1, guardians: 1 })
            .lean()
            .exec();
        const groupById = new Map<string, ChildGroup | undefined>();
        const guardiansById = new Map<string, GuardianInput[]>();
        for (const p of profiles) {
            groupById.set(String(p.userId), p.currentGroup as ChildGroup | undefined);
            guardiansById.set(String(p.userId), (p as any).guardians ?? []);
        }

        return {
            items: users.map((u) => ({
                ...u,
                group: groupById.get(String(u._id)),
                guardians: guardiansById.get(String(u._id)) ?? [],
            })),
            page,
            limit,
            total,
            missingProfileImageCount,
        };
    }

    async getGroupCounts(
        filters: { includeArchived?: boolean },
        currentUser: Record<string, any>,
    ): Promise<{
        total: number;
        counts: Array<{ group: ChildGroup; count: number }>;
        unknownCount: number;
    }> {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;
        const includeArchived = !!filters.includeArchived && isSuper;

        const query: Record<string, any> = { role: UserRole.Child };
        if (!includeArchived) query.lifecycleStatus = LifecycleStatus.Active;
        if (!isSuper) query.originTown = scopeTown;

        const from = this.childProfileModel.collection.name;
        const rows: Array<{ _id: ChildGroup | null; count: number }> = await this.userModel
            .aggregate([
                { $match: query },
                { $lookup: { from, localField: '_id', foreignField: 'userId', as: 'profile' } },
                { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
                { $group: { _id: '$profile.currentGroup', count: { $sum: 1 } } },
            ])
            .exec();

        const counts: Array<{ group: ChildGroup; count: number }> = [];
        let unknownCount = 0;
        let total = 0;

        for (const r of rows) {
            const count = Number(r.count) || 0;
            total += count;
            const group = r._id as ChildGroup | null;
            if (group && Object.values(ChildGroup).includes(group)) {
                counts.push({ group, count });
            } else {
                unknownCount += count;
            }
        }

        counts.sort((a, b) => a.group.localeCompare(b.group));
        return { total, counts, unknownCount };
    }

    async get(id: string, currentUser: Record<string, any>) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;

        const user = await this.userModel.findById(id).lean().exec();
        if (!user || user.role !== UserRole.Child) throw new NotFoundException('Child not found');

        if (!isSuper && user.originTown !== scopeTown) {
            throw new ForbiddenException('Not allowed to access other towns');
        }

        const profile = await this.childProfileModel.findOne({ userId: user._id }).lean().exec();
        return {
            ...user,
            group: profile?.currentGroup as ChildGroup | undefined,
            guardians: (profile as any)?.guardians ?? [],
        };
    }

    async create(
        dto: CreateChildMultipartInput,
        file: UploadedFile | undefined,
        currentUser: Record<string, any>,
    ) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        this.assertCanCreate(currentUser);

        const dob = new Date(dto.dateOfBirth);
        if (Number.isNaN(dob.getTime())) {
            throw new BadRequestException('Invalid dateOfBirth');
        }

        const ageYears = computeAgeYears(dob, new Date());
        if (ageYears < 0) {
            throw new BadRequestException('Invalid dateOfBirth');
        }
        if (ageYears >= 19) {
            throw new BadRequestException('Adults are out of scope (child must be 18 or younger)');
        }

        const guardians = this.parseGuardians(dto.guardiansJson);

        if (!file) {
            throw new BadRequestException('Profile image is required');
        }
        const profileImage = await this.mediaService.uploadProfileImage(file);

        const whatsApp = dto.whatsAppPhoneE164
            ? {
                  phoneE164: dto.whatsAppPhoneE164,
                  optIn: dto.whatsAppOptIn ?? true,
              }
            : undefined;

        const user = await new this.userModel({
            fullName: dto.fullName,
            role: UserRole.Child,
            dateOfBirth: dob,
            originTown: scopeTown,
            preferredLanguage: dto.preferredLanguage ?? 'en',
            whatsApp,
            profileImage,
            lifecycleStatus: LifecycleStatus.Active,
        }).save();

        const mapping = await this.settingsService.getAgeToGroupMapping();
        const group = computeGroupFromAge(ageYears, mapping.bands);
        await this.childProfileModel.findOneAndUpdate(
            { userId: user._id },
            { $set: { currentGroup: group, groupComputedAt: new Date(), guardians } },
            { upsert: true },
        );

        await this.notifyChildCreated({
            childId: String(user._id),
            childName: user.fullName,
            town: scopeTown,
            group,
        });

        return { ...user.toObject(), group, guardians };
    }

    async bulkCreateMultipart(
        childrenJson: string,
        files: UploadedFile[] | undefined,
        currentUser: Record<string, any>,
    ) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        this.assertCanCreate(currentUser);

        const trimmed = (childrenJson ?? '').trim();
        if (!trimmed) throw new BadRequestException('childrenJson is required');

        let parsed: unknown;
        try {
            parsed = JSON.parse(trimmed) as unknown;
        } catch {
            throw new BadRequestException('childrenJson must be valid JSON');
        }
        if (!Array.isArray(parsed) || parsed.length < 1) {
            throw new BadRequestException('childrenJson must be a non-empty array');
        }

        const children = parsed as any[];
        const uploads = files ?? [];
        if (uploads.length !== children.length) {
            throw new BadRequestException(
                `files count must match childrenJson count (${children.length})`,
            );
        }
        if (uploads.some((f) => !f)) {
            throw new BadRequestException('Each child must include a profile image');
        }

        const mapping = await this.settingsService.getAgeToGroupMapping();
        const now = new Date();

        const created: any[] = [];
        const errors: Array<{ index: number; message: string }> = [];

        for (let i = 0; i < children.length; i += 1) {
            const item = children[i] ?? {};
            const file = uploads[i];
            try {
                const fullName = String(item.fullName ?? '').trim();
                if (fullName.length < 2) throw new BadRequestException('Invalid fullName');

                const dob = new Date(item.dateOfBirth);
                if (Number.isNaN(dob.getTime())) {
                    throw new BadRequestException('Invalid dateOfBirth');
                }
                const ageYears = computeAgeYears(dob, now);
                if (ageYears < 0) throw new BadRequestException('Invalid dateOfBirth');
                if (ageYears >= 19) {
                    throw new BadRequestException(
                        'Adults are out of scope (child must be 18 or younger)',
                    );
                }

                const guardians = this.normalizeGuardiansArray(item.guardians);
                const profileImage = await this.mediaService.uploadProfileImage(file);

                const whatsApp = item.whatsAppPhoneE164
                    ? {
                          phoneE164: String(item.whatsAppPhoneE164 ?? ''),
                          optIn:
                              typeof item.whatsAppOptIn === 'boolean' ? item.whatsAppOptIn : true,
                      }
                    : undefined;

                const user = await new this.userModel({
                    fullName,
                    role: UserRole.Child,
                    dateOfBirth: dob,
                    originTown: scopeTown,
                    preferredLanguage: item.preferredLanguage ?? 'en',
                    whatsApp,
                    profileImage,
                    lifecycleStatus: LifecycleStatus.Active,
                }).save();

                const group = computeGroupFromAge(ageYears, mapping.bands);
                await this.childProfileModel.findOneAndUpdate(
                    { userId: user._id },
                    {
                        $set: {
                            currentGroup: group,
                            groupComputedAt: now,
                            guardians,
                        },
                    },
                    { upsert: true },
                );

                created.push({ ...user.toObject(), group, guardians });
            } catch (err) {
                const message = err?.message ?? 'Invalid child record';
                errors.push({ index: i, message });
            }
        }

        if (created.length) {
            await this.notifyChildrenBulkCreated({
                town: scopeTown,
                totalCreated: created.length,
                sampleNames: created.slice(0, 10).map((c) => c.fullName as string),
            });
        }

        return { created, errors };
    }

    async bulkCreate(children: CreateChildDto[], currentUser: Record<string, any>) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        this.assertCanCreate(currentUser);

        const mapping = await this.settingsService.getAgeToGroupMapping();
        const now = new Date();

        const created: any[] = [];
        const errors: Array<{ index: number; message: string }> = [];

        for (let i = 0; i < children.length; i += 1) {
            const item = children[i];
            try {
                const dob = new Date(item.dateOfBirth);
                if (Number.isNaN(dob.getTime())) {
                    throw new BadRequestException('Invalid dateOfBirth');
                }
                const ageYears = computeAgeYears(dob, now);
                if (ageYears < 0) {
                    throw new BadRequestException('Invalid dateOfBirth');
                }
                if (ageYears >= 19) {
                    throw new BadRequestException(
                        'Adults are out of scope (child must be 18 or younger)',
                    );
                }

                const whatsApp = item.whatsAppPhoneE164
                    ? {
                          phoneE164: item.whatsAppPhoneE164,
                          optIn: item.whatsAppOptIn ?? true,
                      }
                    : undefined;

                const user = await new this.userModel({
                    fullName: item.fullName,
                    role: UserRole.Child,
                    dateOfBirth: dob,
                    originTown: scopeTown,
                    preferredLanguage: item.preferredLanguage ?? 'en',
                    whatsApp,
                    lifecycleStatus: LifecycleStatus.Active,
                }).save();

                const group = computeGroupFromAge(ageYears, mapping.bands);
                await this.childProfileModel.findOneAndUpdate(
                    { userId: user._id },
                    {
                        $set: {
                            currentGroup: group,
                            groupComputedAt: now,
                            guardians: (item.guardians ?? []) as any,
                        },
                    },
                    { upsert: true },
                );

                created.push({ ...user.toObject(), group, guardians: item.guardians });
            } catch (err) {
                const message = err?.message ?? 'Invalid child record';
                errors.push({ index: i, message });
            }
        }

        if (created.length) {
            await this.notifyChildrenBulkCreated({
                town: scopeTown,
                totalCreated: created.length,
                sampleNames: created.slice(0, 10).map((c) => c.fullName as string),
            });
        }

        return { created, errors };
    }

    async uploadProfileImage(
        childId: string,
        file: UploadedFile,
        currentUser: Record<string, any>,
    ) {
        if (!file) throw new BadRequestException('No file uploaded');
        const child = await this.userModel.findById(childId).lean().exec();
        if (!child || child.role !== UserRole.Child) throw new NotFoundException('Child not found');

        await this.assertCanManageChild(currentUser, child);

        const oldImage = child.profileImage as
            | { url?: string; provider?: string; publicId?: string }
            | undefined;
        const profileImage = await this.mediaService.uploadProfileImage(file);
        const updated = await this.userModel
            .findByIdAndUpdate(childId, { $set: { profileImage } }, { new: true })
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Child not found');

        if (oldImage?.url && oldImage.url !== profileImage.url) {
            try {
                await this.mediaService.deleteProfileImage(oldImage);
            } catch {
                // Ignore cleanup errors to avoid blocking profile updates.
            }
        }

        const profile = await this.childProfileModel.findOne({ userId: updated._id }).lean().exec();
        return {
            ...updated,
            group: profile?.currentGroup as ChildGroup | undefined,
            guardians: (profile as any)?.guardians ?? [],
        };
    }

    async archive(childId: string, currentUser: Record<string, any>) {
        const child = await this.userModel.findById(childId).lean().exec();
        if (!child || child.role !== UserRole.Child) throw new NotFoundException('Child not found');

        await this.assertCanManageChild(currentUser, child);

        const updated = await this.userModel
            .findByIdAndUpdate(
                childId,
                {
                    $set: {
                        lifecycleStatus: LifecycleStatus.Archived,
                        archivedReason: 'manual_archive',
                    },
                },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Child not found');

        const profile = await this.childProfileModel.findOne({ userId: updated._id }).lean().exec();
        return {
            ...updated,
            group: profile?.currentGroup as ChildGroup | undefined,
            guardians: (profile as any)?.guardians ?? [],
        };
    }

    async getStats(childId: string, currentUser: Record<string, any>) {
        await this.get(childId, currentUser);

        const childObjId = new Types.ObjectId(childId);
        const rows = await this.attendanceModel
            .aggregate([
                {
                    $match: {
                        entries: {
                            $elemMatch: {
                                userId: childObjId,
                                roleAtTime: AttendanceRoleAtTime.Child,
                            },
                        },
                    },
                },
                { $unwind: '$entries' },
                {
                    $match: {
                        'entries.userId': childObjId,
                        'entries.roleAtTime': AttendanceRoleAtTime.Child,
                    },
                },
                {
                    $lookup: {
                        from: this.activityModel.collection.name,
                        localField: 'activityId',
                        foreignField: '_id',
                        as: 'activity',
                    },
                },
                { $unwind: '$activity' },
                {
                    $project: {
                        present: '$entries.present',
                        activityType: '$activity.type',
                        startDate: '$activity.startDate',
                    },
                },
                {
                    $group: {
                        _id: '$activityType',
                        totalRecords: { $sum: 1 },
                        presentCount: {
                            $sum: {
                                $cond: [{ $eq: ['$present', true] }, 1, 0],
                            },
                        },
                        absentCount: {
                            $sum: {
                                $cond: [{ $eq: ['$present', false] }, 1, 0],
                            },
                        },
                        lastAttendanceAt: { $max: '$startDate' },
                        lastPresentAt: {
                            $max: {
                                $cond: [{ $eq: ['$present', true] }, '$startDate', null],
                            },
                        },
                    },
                },
            ])
            .exec();

        const byType = rows.map((r) => ({
            activityType: r._id as ActivityType,
            totalRecords: r.totalRecords as number,
            presentCount: r.presentCount as number,
            absentCount: r.absentCount as number,
            lastPresentAt: r.lastPresentAt ? new Date(r.lastPresentAt) : undefined,
        }));

        const totalAttendanceRecords = byType.reduce((sum, r) => sum + r.totalRecords, 0);
        const presentCount = byType.reduce((sum, r) => sum + r.presentCount, 0);
        const absentCount = byType.reduce((sum, r) => sum + r.absentCount, 0);
        const lastAttendanceAtMs = rows.length
            ? Math.max(...rows.map((r) => new Date(r.lastAttendanceAt as Date).getTime()))
            : undefined;
        const lastAttendanceAt =
            typeof lastAttendanceAtMs === 'number' ? new Date(lastAttendanceAtMs) : undefined;

        const presentMs = rows
            .map((r) => (r.lastPresentAt ? new Date(r.lastPresentAt as Date).getTime() : undefined))
            .filter((x): x is number => typeof x === 'number' && x > 0);
        const lastPresentAtMs = presentMs.length ? Math.max(...presentMs) : undefined;
        const lastPresentAt =
            typeof lastPresentAtMs === 'number' ? new Date(lastPresentAtMs) : undefined;

        return {
            childId,
            totalAttendanceRecords,
            presentCount,
            absentCount,
            lastAttendanceAt,
            lastPresentAt: presentCount ? lastPresentAt : undefined,
            byActivityType: byType,
        };
    }

    private assertCanCreate(currentUser: Record<string, any>) {
        const level = currentUser?.monitorLevel as MonitorLevel | undefined;
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can create children');
        }
        if (level !== MonitorLevel.Official && level !== MonitorLevel.Super) {
            throw new ForbiddenException('Only Official and Super Monitors can create children');
        }
    }

    private async assertCanManageChild(
        currentUser: Record<string, any>,
        child: Record<string, any>,
    ) {
        this.assertCanCreate(currentUser);
        if (currentUser?.monitorLevel === MonitorLevel.Super) return;

        const town = await this.resolveMonitorTownOrFail(currentUser);
        if ((child.originTown as Town | undefined) !== town) {
            throw new ForbiddenException('Not allowed to manage other towns');
        }
    }

    private async resolveMonitorTownOrFail(currentUser: Record<string, any>): Promise<Town> {
        const town = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!town) throw new ForbiddenException('Monitor town not set');
        return town;
    }

    private async notifyChildCreated(params: {
        childId: string;
        childName: string;
        town: Town;
        group?: ChildGroup;
    }) {
        const recipients = await this.usersService.findSuperMonitorsByTownForApproval(params.town);
        if (!recipients.length) return;

        const appUrl = `${this.config.frontendBaseUrl}/children/${params.childId}`;
        const subject = `New child created — ${params.town}`;
        const message =
            `A child profile was created.\n\n` +
            `Name: ${params.childName}\n` +
            `Town: ${params.town}\n` +
            `Group: ${params.group ?? 'Unknown'}\n\n` +
            `Open: ${appUrl}`;

        for (const r of recipients) {
            const to = r.email;
            if (!to) continue;
            await this.notificationService.send({
                userId: r.id,
                to,
                subject,
                message,
                templateName: 'child-created',
                templateData: {
                    subject,
                    childName: params.childName,
                    town: params.town,
                    group: params.group ?? 'Unknown',
                    appUrl,
                },
                actions: [{ id: 'OPEN_CHILD', label: 'Open child', redirectUrl: appUrl }],
                contextType: NotificationContextType.Child,
                contextId: `child_created:${params.childId}`,
            });
        }
    }

    private async notifyChildrenBulkCreated(params: {
        town: Town;
        totalCreated: number;
        sampleNames: string[];
    }) {
        const recipients = await this.usersService.findSuperMonitorsByTownForApproval(params.town);
        if (!recipients.length) return;

        const listUrl = `${this.config.frontendBaseUrl}/children`;
        const subject = `Children created (bulk) — ${params.town}`;

        const sample = params.sampleNames.length
            ? `\nSample:\n- ${params.sampleNames.join('\n- ')}`
            : '';
        const message =
            `Bulk child creation completed.\n\n` +
            `Town: ${params.town}\n` +
            `Created: ${params.totalCreated}\n` +
            sample +
            `\n\nOpen list: ${listUrl}`;

        for (const r of recipients) {
            const to = r.email;
            if (!to) continue;
            await this.notificationService.send({
                userId: r.id,
                to,
                subject,
                message,
                templateName: 'children-bulk-created',
                templateData: {
                    subject,
                    town: params.town,
                    totalCreated: params.totalCreated,
                    sampleNames: params.sampleNames,
                    listUrl,
                },
                actions: [{ id: 'OPEN_CHILDREN', label: 'Open children', redirectUrl: listUrl }],
                contextType: NotificationContextType.Child,
                contextId: `children_bulk_created:${params.town}:${Date.now()}`,
            });
        }
    }

    private parseGuardians(raw: string): GuardianInput[] {
        const trimmed = (raw ?? '').trim();
        if (!trimmed) {
            throw new BadRequestException('guardiansJson is required');
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(trimmed) as unknown;
        } catch {
            throw new BadRequestException('guardiansJson must be valid JSON');
        }

        if (!Array.isArray(parsed) || parsed.length < 1) {
            throw new BadRequestException('At least one parent/guardian is required');
        }

        const guardians: GuardianInput[] = [];
        for (const item of parsed) {
            if (!item || typeof item !== 'object') {
                throw new BadRequestException('Invalid guardian entry');
            }
            const g = item as any;
            const fullName = String(g.fullName ?? '').trim();
            const phoneE164 = String(g.phoneE164 ?? '').trim();
            const relationship = String(g.relationship ?? '').trim();
            const email = g.email ? String(g.email).trim() : undefined;

            if (!fullName || !phoneE164 || !relationship) {
                throw new BadRequestException(
                    'Each guardian requires fullName, phoneE164, relationship',
                );
            }

            guardians.push({ fullName, phoneE164, relationship, email: email || undefined });
        }

        return guardians;
    }

    private normalizeGuardiansArray(raw: unknown): GuardianInput[] {
        if (!Array.isArray(raw) || raw.length < 1) {
            throw new BadRequestException('At least one parent/guardian is required');
        }

        const guardians: GuardianInput[] = [];
        for (const item of raw) {
            if (!item || typeof item !== 'object') {
                throw new BadRequestException('Invalid guardian entry');
            }
            const g = item as any;
            const fullName = String(g.fullName ?? '').trim();
            const phoneE164 = String(g.phoneE164 ?? '').trim();
            const relationship = String(g.relationship ?? '').trim();
            const email = g.email ? String(g.email).trim() : undefined;

            if (!fullName || !phoneE164 || !relationship) {
                throw new BadRequestException(
                    'Each guardian requires fullName, phoneE164, relationship',
                );
            }

            guardians.push({ fullName, phoneE164, relationship, email: email || undefined });
        }

        return guardians;
    }
}
