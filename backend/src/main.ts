import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { validerEnvironnement } from './config/env.validation';
import { configurerApplication } from './config/application.config';

async function bootstrap() {
  // 1. Validation des variables d environnement AVANT tout le reste.
  // Si une variable critique manque, le serveur refuse de demarrer.
  validerEnvironnement();

  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Desactive le header X-Powered-By (information disclosure)
    // Helmet s en charge, mais on peut aussi le desactiver globalement.
  });

  // 2. Configuration commune (Helmet, prefixe /api, validation, CORS, statique)
  configurerApplication(app);

  // 3. Graceful shutdown : ferme proprement les connexions (base de donnees, HTTP)
  // lors d un SIGTERM ou SIGINT (docker stop, redemarrage).
  app.enableShutdownHooks();

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
