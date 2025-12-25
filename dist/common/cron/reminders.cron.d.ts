import { OnModuleInit } from '@nestjs/common';
import { RemindersService } from '../../reminders/reminders.service';
export declare class RemindersCron implements OnModuleInit {
    private readonly remindersService;
    private readonly logger;
    constructor(remindersService: RemindersService);
    onModuleInit(): void;
}
