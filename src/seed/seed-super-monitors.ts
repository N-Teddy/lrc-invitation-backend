import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { Town } from '../common/enums/activity.enum';

type SeedSuperMonitor = {
    fullName: string;
    email: string;
    homeTown: Town;
    preferredLanguage?: string;
};

function parseSeedEnv(): SeedSuperMonitor[] {
    const raw = process.env.SEED_SUPER_MONITORS_JSON?.trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
        throw new Error('SEED_SUPER_MONITORS_JSON must be a JSON array');
    }
    return parsed.map((item) => {
        if (!item || typeof item !== 'object') {
            throw new Error('Invalid seed entry');
        }
        const rec = item as any;
        if (!rec.fullName || !rec.email || !rec.homeTown) {
            throw new Error('Seed entry must include fullName, email, homeTown');
        }
        if (!Object.values(Town).includes(rec.homeTown)) {
            throw new Error(`Invalid homeTown: ${rec.homeTown}`);
        }
        return {
            fullName: String(rec.fullName),
            email: String(rec.email).toLowerCase(),
            homeTown: rec.homeTown as Town,
            preferredLanguage: rec.preferredLanguage ? String(rec.preferredLanguage) : undefined,
        };
    });
}

async function main() {
    const seeds = parseSeedEnv();
    if (!seeds.length) {
        // eslint-disable-next-line no-console
        console.log('No super monitors to seed (SEED_SUPER_MONITORS_JSON is empty).');
        return;
    }

    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const usersService = app.get(UsersService);
    const authService = app.get(AuthService);

    for (const seed of seeds) {
        const existing = await usersService.findByEmail(seed.email);
        if (existing) {
            // eslint-disable-next-line no-console
            console.log(`Super monitor already exists: ${seed.email} (${existing.id})`);
        } else {
            const created = await usersService.create({
                fullName: seed.fullName,
                email: seed.email,
                role: UserRole.Monitor,
                monitorLevel: MonitorLevel.Super,
                originTown: seed.homeTown,
                homeTown: seed.homeTown,
                preferredLanguage: seed.preferredLanguage,
                registrationPendingApproval: false,
                whatsAppOptIn: false,
            });
            // eslint-disable-next-line no-console
            console.log(`Created super monitor: ${seed.email} (${created.id})`);
        }

        await authService.requestMagicLink(seed.email);
        // eslint-disable-next-line no-console
        console.log(`Sent sign-in link: ${seed.email}`);
    }

    await app.close();
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
