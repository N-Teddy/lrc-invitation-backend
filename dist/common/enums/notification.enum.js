"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = exports.ReminderStatus = exports.ReminderKind = exports.NotificationStatus = exports.NotificationContextType = void 0;
var NotificationContextType;
(function (NotificationContextType) {
    NotificationContextType["Activity"] = "activity";
    NotificationContextType["Conference"] = "conference";
    NotificationContextType["AttendanceReport"] = "attendance_report";
    NotificationContextType["Birthday"] = "birthday";
    NotificationContextType["Transition"] = "transition";
    NotificationContextType["Reminder"] = "reminder";
    NotificationContextType["Payment"] = "payment";
    NotificationContextType["GroupChange"] = "group_change";
    NotificationContextType["Child"] = "child";
})(NotificationContextType || (exports.NotificationContextType = NotificationContextType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["Queued"] = "queued";
    NotificationStatus["Sent"] = "sent";
    NotificationStatus["Delivered"] = "delivered";
    NotificationStatus["Read"] = "read";
    NotificationStatus["Failed"] = "failed";
    NotificationStatus["Acknowledged"] = "acknowledged";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var ReminderKind;
(function (ReminderKind) {
    ReminderKind["Custom"] = "custom";
    ReminderKind["GroupChange"] = "group_change";
})(ReminderKind || (exports.ReminderKind = ReminderKind = {}));
var ReminderStatus;
(function (ReminderStatus) {
    ReminderStatus["Draft"] = "draft";
    ReminderStatus["Active"] = "active";
    ReminderStatus["Paused"] = "paused";
    ReminderStatus["Ended"] = "ended";
})(ReminderStatus || (exports.ReminderStatus = ReminderStatus = {}));
var Channel;
(function (Channel) {
    Channel["WhatsApp"] = "whatsapp";
    Channel["Email"] = "email";
    Channel["InApp"] = "in_app";
})(Channel || (exports.Channel = Channel = {}));
//# sourceMappingURL=notification.enum.js.map