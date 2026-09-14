import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true,}));
  app.setGlobalPrefix('api');
  // Autoriser l'origine et les cookies (avec Credentials) afin que le
  // frontend puisse envoyer/recevoir le cookie HttpOnly JWT.
  app.enableCors({ origin: true, credentials: true });

  const config = new DocumentBuilder()
    .setTitle('Plateforme gestion projets et partenariats')
    .setDescription('API pour la plateforme de gestion des projets et partenariats de l\'Université de Fianarantsoa')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`Application démarrée sur http://localhost:${process.env.PORT || 3000}`);
}
bootstrap();