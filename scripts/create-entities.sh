#!/bin/bash

# create-project-structure.sh

echo "Creating complete project structure with folders and files..."

# Create main src directory
mkdir -p src

# Create common subdirectories and files
mkdir -p src/common/decorators
touch src/common/decorators/roles.decorator.ts
touch src/common/decorators/public.decorator.ts

mkdir -p src/common/enums
touch src/common/enums/role.enum.ts
touch src/common/enums/activity-type.enum.ts
touch src/common/enums/payment-status.enum.ts
touch src/common/enums/notification-channel.enum.ts

mkdir -p src/common/exceptions
touch src/common/exceptions/business.exception.ts
touch src/common/exceptions/validation.exception.ts

mkdir -p src/common/guards
touch src/common/guards/jwt-auth.guard.ts
touch src/common/guards/roles.guard.ts

mkdir -p src/common/interfaces
touch src/common/interfaces/eligibility-result.interface.ts

# Create entities directory and files
mkdir -p src/entities
touch src/entities/town.entity.ts
touch src/entities/monitor.entity.ts
touch src/entities/child.entity.ts
touch src/entities/age-group.entity.ts
touch src/entities/activity-type.entity.ts
touch src/entities/activity.entity.ts
touch src/entities/activity-target-group.entity.ts
touch src/entities/participant.entity.ts
touch src/entities/attendance.entity.ts
touch src/entities/monitor-contribution.entity.ts
touch src/entities/notification-log.entity.ts
touch src/entities/system-configuration.entity.ts

# Create request directory and files
mkdir -p src/request
touch src/request/auth.request.ts
touch src/request/monitor.request.ts
touch src/request/child.request.ts
touch src/request/activity.request.ts
touch src/request/attendance.request.ts
touch src/request/contribution.request.ts

# Create response directory and files
mkdir -p src/response
touch src/response/auth.response.ts
touch src/response/monitor.response.ts
touch src/response/child.response.ts
touch src/response/activity.response.ts
touch src/response/participant.response.ts
touch src/response/common.response.ts

# Create modules subdirectories and files
mkdir -p src/modules/auth/strategies
touch src/modules/auth/auth.module.ts
touch src/modules/auth/auth.controller.ts
touch src/modules/auth/auth.service.ts
touch src/modules/auth/strategies/jwt.strategy.ts

mkdir -p src/modules/monitor
touch src/modules/monitor/monitor.module.ts
touch src/modules/monitor/monitor.controller.ts
touch src/modules/monitor/monitor.service.ts

mkdir -p src/modules/child
touch src/modules/child/child.module.ts
touch src/modules/child/child.controller.ts
touch src/modules/child/child.service.ts

mkdir -p src/modules/activity
touch src/modules/activity/activity.module.ts
touch src/modules/activity/activity.controller.ts
touch src/modules/activity/activity.service.ts

mkdir -p src/modules/participation
touch src/modules/participation/participation.module.ts
touch src/modules/participation/participation.controller.ts
touch src/modules/participation/participation.service.ts

mkdir -p src/modules/attendance
touch src/modules/attendance/attendance.module.ts
touch src/modules/attendance/attendance.controller.ts
touch src/modules/attendance/attendance.service.ts

mkdir -p src/modules/contribution
touch src/modules/contribution/contribution.module.ts
touch src/modules/contribution/contribution.controller.ts
touch src/modules/contribution/contribution.service.ts

mkdir -p src/modules/notification
touch src/modules/notification/notification.module.ts
touch src/modules/notification/notification.service.ts
touch src/modules/notification/email.service.ts
touch src/modules/notification/whatsapp.service.ts

mkdir -p src/modules/scheduler
touch src/modules/scheduler/scheduler.module.ts
touch src/modules/scheduler/scheduler.service.ts

mkdir -p src/modules/town
touch src/modules/town/town.module.ts
touch src/modules/town/town.controller.ts
touch src/modules/town/town.service.ts

mkdir -p src/modules/age-group
touch src/modules/age-group/age-group.module.ts
touch src/modules/age-group/age-group.controller.ts
touch src/modules/age-group/age-group.service.ts

mkdir -p src/modules/configuration
touch src/modules/configuration/configuration.module.ts
touch src/modules/configuration/configuration.controller.ts
touch src/modules/configuration/configuration.service.ts

mkdir -p src/modules/report
touch src/modules/report/report.module.ts
touch src/modules/report/report.controller.ts
touch src/modules/report/report.service.ts

# Create database directories
mkdir -p src/database/migrations
mkdir -p src/database/seeds

# Create config directory and files
mkdir -p src/config
touch src/config/database.config.ts
touch src/config/jwt.config.ts
touch src/config/app.config.ts

echo "Project structure created successfully!"
echo ""
echo "Created structure:"
find src -type f | sort