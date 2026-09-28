import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validerEnvironnement } from './config/env.validation';

async function bootstrap() {
  // 1. Validation des variables d environnement AVANT tout le reste.
  // Si une variable critique manque, le serveur refuse de demarrer.
  validerEnvironnement();

  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Desactive le header X-Powered-By (information disclosure)
    // Helmet s en charge, mais on peut aussi le desactiver globalement.
  });

  // 2. Helmet : en-tetes de securite HTTP.
  // contentSecurityPolicy desactive car l API sert Swagger UI (scripts inline).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 3. Graceful shutdown : ferme proprement les connexions (Prisma, HTTP)
  // lors d un SIGTERM ou SIGINT (docker stop, redemarrage).
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Authentification par Bearer token (header Authorization).
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Servir les fichiers uploades (documents, logos, photos)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('Plateforme gestion projets et partenariats')
    .setDescription(
      "API pour la plateforme de gestion des projets et partenariats de l'Université de Fianarantsoa",
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application démarrée sur http://localhost:${port}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  const message = err instanceof Error ? err.message : String(err);
  logger.error(`Echec du demarrage : ${message}`);
  process.exit(1);
});