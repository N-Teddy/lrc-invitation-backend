import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { join } from 'path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: true,
    });

    const globalPrefix = process.env.APP_GLOBAL_PREFIX ?? 'api';
    const docsPath = process.env.APP_DOCS_PATH ?? 'api/docs';
    app.setGlobalPrefix(globalPrefix);

    app.use(
        helmet({
            // Allow the frontend to load images from `/uploads` hosted on this API origin.
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        }),
    );
    app.use(
        compression({
            threshold: 0,
        }),
    );
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
    const corsOriginsRaw = process.env.CORS_ORIGIN?.trim() ?? '*';
    const corsCredentials = process.env.CORS_CREDENTIALS === 'true';
    const corsOrigins =
        corsOriginsRaw === '*'
            ? '*'
            : corsOriginsRaw
                  .split(',')
                  .map((x) => x.trim())
                  .filter(Boolean);

    app.enableCors({
        origin: corsOrigins === '*' ? (corsCredentials ? true : '*') : corsOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: corsCredentials,
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );
    const reflector = app.get(Reflector);
    const timeoutMs = Number(process.env.APP_TIMEOUT_MS ?? 10000);
    app.useGlobalInterceptors(
        new LoggingInterceptor(),
        new TimeoutInterceptor(timeoutMs),
        new ClassSerializerInterceptor(reflector),
        new ResponseInterceptor(),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    const config = new DocumentBuilder()
        .setTitle('LRC-Jeunesse API')
        .setDescription('Management API for activities, attendance, payments, and messaging.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addServer(`/${globalPrefix}`, 'Default')
        .build();
    const document = SwaggerModule.createDocument(app, config, {
        ignoreGlobalPrefix: true,
    });
    SwaggerModule.setup(docsPath, app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
        customSiteTitle: 'LRC-Jeunesse API Documentation',
        customCss: `
            html, body { background: #0b1220; }
            .swagger-ui { color: #e5e7eb; }
            .swagger-ui .topbar { background-color: #111827; }
            .swagger-ui .topbar a { color: #e5e7eb; }
            .swagger-ui .info .title, .swagger-ui .info p, .swagger-ui .info li { color: #e5e7eb; }
            .swagger-ui .scheme-container { background: #0f172a; box-shadow: none; }
            .swagger-ui .opblock { background: #0f172a; border-color: #1f2937; }
            .swagger-ui .opblock .opblock-summary { border-color: #1f2937; }
            .swagger-ui .opblock .opblock-summary-description,
            .swagger-ui .opblock .opblock-summary-path,
            .swagger-ui .opblock .opblock-summary-method { color: #e5e7eb; }
            .swagger-ui .model-box, .swagger-ui .model { color: #e5e7eb; }
            .swagger-ui .parameters-container,
            .swagger-ui .responses-inner,
            .swagger-ui .opblock-description-wrapper,
            .swagger-ui .opblock-external-docs-wrapper,
            .swagger-ui .opblock-body pre { background: #0b1220; color: #e5e7eb; }
            .swagger-ui input[type="text"], .swagger-ui textarea { background: #0b1220; color: #e5e7eb; border-color: #374151; }
            .swagger-ui .btn { background: #111827; color: #e5e7eb; border-color: #374151; }
            .swagger-ui .btn:hover { background: #1f2937; }
            .swagger-ui .tab li button.tablinks { color: #e5e7eb; }
            .swagger-ui .response-col_status { color: #e5e7eb; }
        `,
    });

    app.enableShutdownHooks();

    const port = Number(process.env.PORT ?? process.env.APP_PORT ?? 3000);
    await app.listen(port, '0.0.0.0');
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    Logger.log(`📚 Swagger documentation: http://localhost:${port}/${docsPath}`);
}
void bootstrap();
