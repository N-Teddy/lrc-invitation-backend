export enum NotificationContextType {
    Activity = 'activity',
    Conference = 'conference',
    AttendanceReport = 'attendance_report',
    Birthday = 'birthday',
    Transition = 'transition',
    Reminder = 'reminder',
    Payment = 'payment',
    GroupChange = 'group_change',
}

export enum NotificationStatus {
    Queued = 'queued',
    Sent = 'sent',
    Delivered = 'delivered',
    Read = 'read',
    Failed = 'failed',
    Acknowledged = 'acknowledged',
}

export enum ReminderKind {
    Custom = 'custom',
    GroupChange = 'group_change',
}

export enum ReminderStatus {
    Draft = 'draft',
    Active = 'active',
    Paused = 'paused',
    Ended = 'ended',
}

export enum Channel {
    WhatsApp = 'whatsapp',
    Email = 'email',
    InApp = 'in_app',
}
