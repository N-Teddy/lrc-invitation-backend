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
var RemindersCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersCron = void 0;
const common_1 = require("@nestjs/common");
const cron_util_1 = require("../utils/cron.util");
const reminders_service_1 = require("../../reminders/reminders.service");
let RemindersCron = RemindersCron_1 = class RemindersCron {
    constructor(remindersService) {
        this.remindersService = remindersService;
        this.logger = new common_1.Logger(RemindersCron_1.name);
    }
    onModuleInit() {
        (0, cron_util_1.scheduleEveryMs)(60_000, async () => {
            try {
                await this.remindersService.processDueReminders(new Date());
            }
            catch (err) {
                this.logger.error(`Reminder processing failed: ${err?.message ?? err}`);
            }
        }, { initialDelayMs: 5000 });
    }
};
exports.RemindersCron = RemindersCron;
exports.RemindersCron = RemindersCron = RemindersCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reminders_service_1.RemindersService])
], RemindersCron);
//# sourceMappingURL=reminders.cron.js.map