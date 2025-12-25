"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const users_service_1 = require("../users/users.service");
const auth_service_1 = require("../auth/auth.service");
const user_enum_1 = require("../common/enums/user.enum");
const activity_enum_1 = require("../common/enums/activity.enum");
function parseSeedEnv() {
    const raw = process.env.SEED_SUPER_MONITORS_JSON?.trim();
    if (!raw)
        return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error('SEED_SUPER_MONITORS_JSON must be a JSON array');
    }
    return parsed.map((item) => {
        if (!item || typeof item !== 'object') {
            throw new Error('Invalid seed entry');
        }
        const rec = item;
        if (!rec.fullName || !rec.email || !rec.homeTown) {
            throw new Error('Seed entry must include fullName, email, homeTown');
        }
        if (!Object.values(activity_enum_1.Town).includes(rec.homeTown)) {
            throw new Error(`Invalid homeTown: ${rec.homeTown}`);
        }
        return {
            fullName: String(rec.fullName),
            email: String(rec.email).toLowerCase(),
            homeTown: rec.homeTown,
            preferredLanguage: rec.preferredLanguage ? String(rec.preferredLanguage) : undefined,
        };
    });
}
async function main() {
    const seeds = parseSeedEnv();
    if (!seeds.length) {
        console.log('No super monitors to seed (SEED_SUPER_MONITORS_JSON is empty).');
        return;
    }
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: false });
    const usersService = app.get(users_service_1.UsersService);
    const authService = app.get(auth_service_1.AuthService);
    for (const seed of seeds) {
        const existing = await usersService.findByEmail(seed.email);
        if (existing) {
            console.log(`Super monitor already exists: ${seed.email} (${existing.id})`);
        }
        else {
            const created = await usersService.create({
                fullName: seed.fullName,
                email: seed.email,
                role: user_enum_1.UserRole.Monitor,
                monitorLevel: user_enum_1.MonitorLevel.Super,
                originTown: seed.homeTown,
                homeTown: seed.homeTown,
                preferredLanguage: seed.preferredLanguage,
                registrationPendingApproval: false,
                whatsAppOptIn: false,
            });
            console.log(`Created super monitor: ${seed.email} (${created.id})`);
        }
        await authService.requestMagicLink(seed.email);
        console.log(`Sent sign-in link: ${seed.email}`);
    }
    await app.close();
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed-super-monitors.js.map