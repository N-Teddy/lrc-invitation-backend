src/
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── enums/
│   │   ├── role.enum.ts
│   │   ├── activity-type.enum.ts
│   │   ├── payment-status.enum.ts
│   │   └── notification-channel.enum.ts
│   ├── exceptions/
│   │   ├── business.exception.ts
│   │   └── validation.exception.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── interfaces/
│       └── eligibility-result.interface.ts
├── entities/
│   ├── town.entity.ts
│   ├── monitor.entity.ts
│   ├── child.entity.ts
│   ├── age-group.entity.ts
│   ├── activity-type.entity.ts
│   ├── activity.entity.ts
│   ├── activity-target-group.entity.ts
│   ├── participant.entity.ts
│   ├── attendance.entity.ts
│   ├── monitor-contribution.entity.ts
│   ├── notification-log.entity.ts
│   └── system-configuration.entity.ts
├── request/
│   ├── auth.request.ts
│   ├── monitor.request.ts
│   ├── child.request.ts
│   ├── activity.request.ts
│   ├── attendance.request.ts
│   └── contribution.request.ts
├── response/
│   ├── auth.response.ts
│   ├── monitor.response.ts
│   ├── child.response.ts
│   ├── activity.response.ts
│   ├── participant.response.ts
│   └── common.response.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── monitor/
│   │   ├── monitor.module.ts
│   │   ├── monitor.controller.ts
│   │   └── monitor.service.ts
│   ├── child/
│   │   ├── child.module.ts
│   │   ├── child.controller.ts
│   │   └── child.service.ts
│   ├── activity/
│   │   ├── activity.module.ts
│   │   ├── activity.controller.ts
│   │   └── activity.service.ts
│   ├── participation/
│   │   ├── participation.module.ts
│   │   ├── participation.controller.ts
│   │   └── participation.service.ts
│   ├── attendance/
│   │   ├── attendance.module.ts
│   │   ├── attendance.controller.ts
│   │   └── attendance.service.ts
│   ├── contribution/
│   │   ├── contribution.module.ts
│   │   ├── contribution.controller.ts
│   │   └── contribution.service.ts
│   ├── notification/
│   │   ├── notification.module.ts
│   │   ├── notification.service.ts
│   │   ├── email.service.ts
│   │   └── whatsapp.service.ts
│   ├── scheduler/
│   │   ├── scheduler.module.ts
│   │   └── scheduler.service.ts
│   ├── town/
│   │   ├── town.module.ts
│   │   ├── town.controller.ts
│   │   └── town.service.ts
│   ├── age-group/
│   │   ├── age-group.module.ts
│   │   ├── age-group.controller.ts
│   │   └── age-group.service.ts
│   ├── configuration/
│   │   ├── configuration.module.ts
│   │   ├── configuration.controller.ts
│   │   └── configuration.service.ts
│   └── report/
│       ├── report.module.ts
│       ├── report.controller.ts
│       └── report.service.ts
├── database/
│   ├── migrations/
│   └── seeds/
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
├── app.module.ts
└── main.ts