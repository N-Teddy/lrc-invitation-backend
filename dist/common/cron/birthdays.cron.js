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
var BirthdaysCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BirthdaysCron = void 0;
const common_1 = require("@nestjs/common");
const cron_util_1 = require("../utils/cron.util");
const birthdays_service_1 = require("../../birthdays/birthdays.service");
let BirthdaysCron = BirthdaysCron_1 = class BirthdaysCron {
    constructor(birthdaysService) {
        this.birthdaysService = birthdaysService;
        this.logger = new common_1.Logger(BirthdaysCron_1.name);
    }
    onModuleInit() {
        (0, cron_util_1.scheduleNextDailyRun)({
            hour: 7,
            minute: 30,
            timeZone: 'Africa/Douala',
        }, async () => {
            try {
                await this.birthdaysService.runDaily(new Date());
            }
            catch (err) {
                this.logger.error(`Birthdays job failed: ${err?.message ?? err}`);
            }
        });
    }
};
exports.BirthdaysCron = BirthdaysCron;
exports.BirthdaysCron = BirthdaysCron = BirthdaysCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [birthdays_service_1.BirthdaysService])
], BirthdaysCron);
//# sourceMappingURL=birthdays.cron.js.map