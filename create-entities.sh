#!/bin/bash

echo "Creating complete NestJS project structure..."

# Create request files
mkdir -p src/request
touch src/request/{auth,monitor,child,activity,attendance,contribution}.request.ts

# Create response files
mkdir -p src/response
touch src/response/{auth,monitor,child,activity,participant,common}.response.ts

# Create modules structure
modules=("auth" "monitor" "child" "activity" "participation" "attendance" "contribution" "notification" "scheduler" "town" "age-group" "configuration" "report")

for module in "${modules[@]}"; do
    mkdir -p "src/modules/$module"
    touch "src/modules/$module/$module.module.ts"
    touch "src/modules/$module/$module.controller.ts"
    touch "src/modules/$module/$module.service.ts"
done

# Create additional files for specific modules
mkdir -p src/modules/auth/strategies
touch src/modules/auth/strategies/jwt.strategy.ts

mkdir -p src/modules/notification
touch src/modules/notification/email.service.ts
touch src/modules/notification/whatsapp.service.ts

# Create database structure
mkdir -p src/database/{migrations,seeds}

# Create config files
mkdir -p src/config
touch src/config/{database.config.ts,jwt.config.ts,app.config.ts}

echo "Project structure created successfully!"
echo "Verifying structure..."
find src -type f | sort