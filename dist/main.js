"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const compression = require("compression");
const express = require("express");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const timeout_interceptor_1 = require("./common/interceptors/timeout.interceptor");
const common_2 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const globalPrefix = process.env.APP_GLOBAL_PREFIX ?? 'api';
    const docsPath = process.env.APP_DOCS_PATH ?? 'api/docs';
    app.setGlobalPrefix(globalPrefix);
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use(compression({
        threshold: 0,
    }));
    app.use('/uploads', express.static((0, path_1.join)(process.cwd(), 'uploads')));
    const corsOriginsRaw = process.env.CORS_ORIGIN?.trim() ?? '*';
    const corsCredentials = process.env.CORS_CREDENTIALS === 'true';
    const corsOrigins = corsOriginsRaw === '*'
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
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const reflector = app.get(core_1.Reflector);
    const timeoutMs = Number(process.env.APP_TIMEOUT_MS ?? 10000);
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new timeout_interceptor_1.TimeoutInterceptor(timeoutMs), new common_2.ClassSerializerInterceptor(reflector), new response_interceptor_1.ResponseInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('LRC-Jeunesse API')
        .setDescription('Management API for activities, attendance, payments, and messaging.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addServer(`/${globalPrefix}`, 'Default')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        ignoreGlobalPrefix: true,
    });
    swagger_1.SwaggerModule.setup(docsPath, app, document, {
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
    const port = process.env.APP_PORT ?? process.env.PORT ?? 3000;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    common_1.Logger.log(`📚 Swagger documentation: http://localhost:${port}/${docsPath}`);
}
bootstrap();
//# sourceMappingURL=main.js.map