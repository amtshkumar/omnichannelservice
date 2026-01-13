import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/services/logger.service';
import { Queue } from 'bull';
import { setupBullBoard } from './queue/bull-board.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useLogger(logger);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Setup Bull Board for queue monitoring
  try {
    const notificationQueue = app.get<Queue>('BullQueue_notifications');
    const scheduledQueue = app.get<Queue>('BullQueue_scheduled-notifications');
    const deadLetterQueue = app.get<Queue>('BullQueue_dead-letter');

    const bullBoardRouter = setupBullBoard([
      notificationQueue,
      scheduledQueue,
      deadLetterQueue,
    ]);

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use('/admin/queues', bullBoardRouter);

    logger.log('📊 Bull Board mounted at: /admin/queues');
  } catch (error) {
    logger.warn('⚠️  Bull Board setup failed:', error.message);
  }

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('Comprehensive notification service supporting Email, SMS, Voice, and Push')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('notifications', 'Public notification endpoints')
    .addTag('admin', 'Admin management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('APP_PORT') || 3000;
  const host = configService.get('APP_HOST') || '0.0.0.0';

  await app.listen(port, host);

  logger.log(`🚀 Application is running on: http://${host}:${port}`);
  logger.log(`📚 Swagger documentation: http://${host}:${port}/docs`);
  logger.log(`🌍 Environment: ${configService.get('APP_ENV')}`);
}

bootstrap();
