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
var EmailNotificationSender_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailNotificationSender = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const app_config_service_1 = require("../config/app-config.service");
const template_util_1 = require("../common/utils/template.util");
let EmailNotificationSender = EmailNotificationSender_1 = class EmailNotificationSender {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(EmailNotificationSender_1.name);
        this.transporter = nodemailer.createTransport({
            host: this.config.mailHost,
            port: this.config.mailPort,
            secure: false,
            auth: this.config.mailUser && this.config.mailPass
                ? {
                    user: this.config.mailUser,
                    pass: this.config.mailPass,
                }
                : undefined,
        });
    }
    async send(options) {
        const from = this.config.mailFrom;
        try {
            const subject = options.subject ?? 'Notification';
            const templateName = options.templateName ?? 'generic-notification';
            const templateData = options.templateData ??
                {
                    subject,
                    headline: subject,
                    message: options.message,
                };
            const html = (0, template_util_1.renderEmailTemplate)(templateName, templateData);
            await this.transporter.sendMail({
                from,
                to: options.to,
                subject,
                text: options.message,
                html,
            });
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${options.to}: ${err?.message ?? err}`);
            throw err;
        }
    }
};
exports.EmailNotificationSender = EmailNotificationSender;
exports.EmailNotificationSender = EmailNotificationSender = EmailNotificationSender_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService])
], EmailNotificationSender);
//# sourceMappingURL=email.sender.js.map