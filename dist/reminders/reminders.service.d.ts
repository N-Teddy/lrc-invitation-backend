import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument } from '../schema/reminder.schema';
import { UserDocument } from '../schema/user.schema';
import { AppConfigService } from '../config/app-config.service';
import { NotificationService } from '../notifications/notifications.service';
import { CreateReminderDto, RespondReminderDto, UpdateReminderDto } from '../dtos/request/reminder.dto';
import { TownScopeService } from '../common/services/town-scope.service';
import { InteractionEventDocument } from '../schema/interaction-event.schema';
export declare class RemindersService {
    private readonly reminderModel;
    private readonly userModel;
    private readonly interactionEventModel;
    private readonly townScopeService;
    private readonly config;
    private readonly notificationService;
    constructor(reminderModel: Model<ReminderDocument>, userModel: Model<UserDocument>, interactionEventModel: Model<InteractionEventDocument>, townScopeService: TownScopeService, config: AppConfigService, notificationService: NotificationService);
    create(dto: CreateReminderDto, currentUser: Record<string, any>): Promise<import("mongoose").Document<unknown, {}, Reminder> & Reminder & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    list(currentUser: Record<string, any>): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Reminder> & Reminder & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    findOneOrFail(id: string, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Reminder> & Reminder & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateReminderDto, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Reminder> & Reminder & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    activate(id: string, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Reminder> & Reminder & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    pause(id: string, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Reminder> & Reminder & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    end(id: string, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Reminder> & Reminder & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    acknowledge(id: string, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Reminder> & Reminder & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    respond(id: string, dto: RespondReminderDto, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Reminder> & Reminder & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    processDueReminders(now?: Date): Promise<void>;
    private sendReminder;
    private resolveTo;
    private normalizeSchedule;
    private computeFirstNextRunAt;
    private assertRecipientsAreTownMonitors;
    private assertCanRead;
    private assertCanEdit;
    private assertCanCreate;
    private isSuper;
}
