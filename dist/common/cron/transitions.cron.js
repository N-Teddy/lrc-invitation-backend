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
var TransitionsCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitionsCron = void 0;
const common_1 = require("@nestjs/common");
const cron_util_1 = require("../utils/cron.util");
const reporting_service_1 = require("../../reporting/reporting.service");
let TransitionsCron = TransitionsCron_1 = class TransitionsCron {
    constructor(reportingService) {
        this.reportingService = reportingService;
        this.logger = new common_1.Logger(TransitionsCron_1.name);
    }
    onModuleInit() {
        (0, cron_util_1.scheduleNextDailyRun)({
            hour: 8,
            minute: 30,
            timeZone: 'Africa/Douala',
        }, async () => {
            try {
                await this.reportingService.sendTurning19YearlyReport(new Date());
            }
            catch (err) {
                this.logger.error(`Transitions job failed: ${err?.message ?? err}`);
            }
        });
    }
};
exports.TransitionsCron = TransitionsCron;
exports.TransitionsCron = TransitionsCron = TransitionsCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService])
], TransitionsCron);
//# sourceMappingURL=transitions.cron.js.map