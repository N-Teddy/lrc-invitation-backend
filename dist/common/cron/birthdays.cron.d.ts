import { OnModuleInit } from '@nestjs/common';
import { BirthdaysService } from '../../birthdays/birthdays.service';
export declare class BirthdaysCron implements OnModuleInit {
    private readonly birthdaysService;
    private readonly logger;
    constructor(birthdaysService: BirthdaysService);
    onModuleInit(): void;
}
