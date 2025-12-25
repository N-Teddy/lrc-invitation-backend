export declare enum NotificationContextType {
    Activity = "activity",
    Conference = "conference",
    AttendanceReport = "attendance_report",
    Birthday = "birthday",
    Transition = "transition",
    Reminder = "reminder",
    Payment = "payment",
    GroupChange = "group_change",
    Child = "child"
}
export declare enum NotificationStatus {
    Queued = "queued",
    Sent = "sent",
    Delivered = "delivered",
    Read = "read",
    Failed = "failed",
    Acknowledged = "acknowledged"
}
export declare enum ReminderKind {
    Custom = "custom",
    GroupChange = "group_change"
}
export declare enum ReminderStatus {
    Draft = "draft",
    Active = "active",
    Paused = "paused",
    Ended = "ended"
}
export declare enum Channel {
    WhatsApp = "whatsapp",
    Email = "email",
    InApp = "in_app"
}
