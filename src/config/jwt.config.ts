import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
    'jwt',
    (): JwtModuleOptions => {
        // Convert to number of seconds (7 days = 604800 seconds)
        const expiresIn = parseInt(process.env.JWT_EXPIRES_IN) || 604800;

        return {
            secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
            signOptions: {
                expiresIn,
            },
        };
    },
);