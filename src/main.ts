import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });

    const globalPrefix = process.env.APP_GLOBAL_PREFIX ?? 'api';
    const docsPath = process.env.APP_DOCS_PATH ?? 'api/docs';
    app.setGlobalPrefix(globalPrefix);

    app.use(helmet());
    app.use(
        compression({
            threshold: 0,
        }),
    );
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
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
    });

    app.enableShutdownHooks();

    const port = process.env.APP_PORT ?? process.env.PORT ?? 3000;
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    Logger.log(`📚 Swagger documentation: http://localhost:${port}/${docsPath}`);
}
bootstrap();
