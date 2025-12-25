import { OnModuleInit } from '@nestjs/common';
import { ReportingService } from '../../reporting/reporting.service';
export declare class TransitionsCron implements OnModuleInit {
    private readonly reportingService;
    private readonly logger;
    constructor(reportingService: ReportingService);
    onModuleInit(): void;
}
