import { CreateReminderDto, RespondReminderDto, UpdateReminderDto } from '../dtos/request/reminder.dto';
import { RemindersService } from './reminders.service';
export declare class RemindersController {
    private readonly remindersService;
    constructor(remindersService: RemindersService);
    create(dto: CreateReminderDto, currentUser: any): Promise<import("mongoose").Document<unknown, {}, import("../schema/reminder.schema").Reminder> & import("../schema/reminder.schema").Reminder & {
        _id: import("mongoose").Types.ObjectId;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    list(currentUser: any): Promise<{
        items: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/reminder.schema").Reminder> & import("../schema/reminder.schema").Reminder & {
            _id: import("mongoose").Types.ObjectId;
        }> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
    }>;
    findOne(id: string, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/reminder.schema").Reminder> & import("../schema/reminder.schema").Reminder & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateReminderDto, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/reminder.schema").Reminder> & import("../schema/reminder.schema").Reminder & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    activate(id: string, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/reminder.schema").Reminder> & import("../schema/reminder.schema").Reminder & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    pause(id: string, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/reminder.schema").Reminder> & import("../schema/reminder.schema").Reminder & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    end(id: string, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/reminder.schema").Reminder> & import("../schema/reminder.schema").Reminder & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    acknowledge(id: string, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/reminder.schema").Reminder> & import("../schema/reminder.schema").Reminder & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    respond(id: string, dto: RespondReminderDto, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/reminder.schema").Reminder> & import("../schema/reminder.schema").Reminder & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
