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
var ActivitiesInvitesCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesInvitesCron = void 0;
const common_1 = require("@nestjs/common");
const cron_util_1 = require("../utils/cron.util");
const activities_invites_service_1 = require("../../activities/activities-invites.service");
let ActivitiesInvitesCron = ActivitiesInvitesCron_1 = class ActivitiesInvitesCron {
    constructor(invitesService) {
        this.invitesService = invitesService;
        this.logger = new common_1.Logger(ActivitiesInvitesCron_1.name);
    }
    onModuleInit() {
        (0, cron_util_1.scheduleNextDailyRun)({
            hour: 8,
            minute: 0,
            timeZone: 'Africa/Douala',
        }, async () => {
            try {
                await this.invitesService.runDaily(new Date());
            }
            catch (err) {
                this.logger.error(`3-weeks invites job failed: ${err?.message ?? err}`);
            }
        });
    }
};
exports.ActivitiesInvitesCron = ActivitiesInvitesCron;
exports.ActivitiesInvitesCron = ActivitiesInvitesCron = ActivitiesInvitesCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [activities_invites_service_1.ActivitiesInvitesService])
], ActivitiesInvitesCron);
//# sourceMappingURL=activities-invites.cron.js.map