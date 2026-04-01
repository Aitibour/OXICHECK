import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  // ---------------------------------------------------------------------------
  // Graceful shutdown — allow in-flight requests to complete before exit
  // ---------------------------------------------------------------------------
  app.enableShutdownHooks();

  // ---------------------------------------------------------------------------
  // Global prefix
  // ---------------------------------------------------------------------------
  app.setGlobalPrefix('api');

  // ---------------------------------------------------------------------------
  // Security: helmet (sets a comprehensive suite of HTTP security headers)
  // Helmet runs first so our custom SecurityHeadersMiddleware can override
  // specific values where we want tighter policy.
  // ---------------------------------------------------------------------------
  app.use(helmet());

  // Custom security headers middleware (applied after helmet for overrides)
  const securityHeaders = new SecurityHeadersMiddleware();
  app.use(securityHeaders.use.bind(securityHeaders));

  // ---------------------------------------------------------------------------
  // CORS
  // ---------------------------------------------------------------------------
  const frontendUrl = configService.get<string>('app.frontendUrl', 'http://localhost:3000');
  app.enableCors({
    origin: frontendUrl.split(',').map((url) => url.trim()),
    credentials: true,
  });

  // ---------------------------------------------------------------------------
  // Global validation pipe
  // ---------------------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ---------------------------------------------------------------------------
  // Global exception filter
  // ---------------------------------------------------------------------------
  app.useGlobalFilters(new HttpExceptionFilter());

  // ---------------------------------------------------------------------------
  // Global interceptors
  // Registered here in addition to AppModule providers so they execute in order:
  //   1. LoggingInterceptor — structured request/response logging
  //   2. AuditLogInterceptor — (registered in AppModule) mutation audit trail
  // ---------------------------------------------------------------------------
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ---------------------------------------------------------------------------
  // Swagger / OpenAPI
  // ---------------------------------------------------------------------------
  const version = process.env.npm_package_version ?? '0.1.0';
  const swaggerConfig = new DocumentBuilder()
    .setTitle('HotelCheckIn API')
    .setDescription('API for the HotelCheckIn pre-check-in SaaS platform')
    .setVersion(version)
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'X-API-Key')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // ---------------------------------------------------------------------------
  // Start server
  // ---------------------------------------------------------------------------
  const port = configService.get<number>('app.port', 3001);
  await app.listen(port);
  console.log(`HotelCheckIn API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
