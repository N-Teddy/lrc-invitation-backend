import * as crypto from 'crypto';
(global as any).crypto = crypto;
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	// Enable CORS
	app.enableCors();

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		})
	);

	// API prefix
	app.setGlobalPrefix('api/v1');

	// Swagger documentation
	const config = new DocumentBuilder()
		.setTitle('Church Activities Management API')
		.setDescription('API for managing church children activities')
		.setVersion('1.0')
		.addBearerAuth()
		.addTag('Authentication')
		.addTag('Monitors')
		.addTag('Children')
		.addTag('Towns')
		.addTag('Age Groups')
		.addTag('Activities')
		.addTag('Participation')
		.addTag('Attendance')
		.addTag('Contributions')
		.addTag('Configuration')
		.addTag('Notifications')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	const port = configService.get('port') || 3000;
	await app.listen(port);

	console.log(`
    🚀 Application is running on: http://localhost:${port}
    📚 Swagger documentation: http://localhost:${port}/api/docs
  `);
}

bootstrap();
