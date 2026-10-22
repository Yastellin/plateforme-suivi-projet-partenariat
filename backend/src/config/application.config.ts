import { Logger, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';

/**
 * Configuration commune de l'application HTTP.
 *
 * Utilisee par le point d'entree (src/main.ts) ET par les tests d'integration,
 * afin que les tests valident exactement la configuration de production
 * (securite, prefixe, validation, CORS, fichiers statiques).
 */
export function configurerApplication(app: NestExpressApplication): void {
  const logger = new Logger('Configuration');

  // Helmet : en-tetes de securite HTTP.
  // contentSecurityPolicy desactive car l'API sert Swagger UI (scripts inline).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      // Les photos et logos sont servis par l'API et affichés par le frontend,
      // souvent depuis une origine distincte en développement.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Validation globale des DTO
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
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
      ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  logger.log(`Origines CORS autorisees : ${corsOrigins.join(', ')}`);

  // Seuls les medias réellement publics sont servis sans authentification.
  // Les documents restent hors du middleware statique et passent par
  // /api/documents/:id/telecharger afin d'appliquer les droits d'accès.
  app.useStaticAssets(join(process.cwd(), 'uploads', 'logos'), {
    prefix: '/uploads/logos/',
  });
  app.useStaticAssets(join(process.cwd(), 'uploads', 'publications'), {
    prefix: '/uploads/publications/',
  });
}
