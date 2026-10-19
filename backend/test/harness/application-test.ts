/**
 * Application NestJS complete, branchee sur une base PostgreSQL ephemere.
 *
 * Les migrations TypeORM sont appliquees avant le demarrage : les tests
 * valident donc reellement le schema livre en production.
 */
import { Test } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { configurerApplication } from '../../src/config/application.config';
import { DataSource } from 'typeorm';
import { ENTITES } from '../../src/database/entites';
import { InitSchema1791200000000 } from '../../src/database/migrations/1791200000000-InitSchema';
import { CreatePasswordResetTokens1791292246344 } from '../../src/database/migrations/1791292246344-CreatePasswordResetTokens';
import { CreateMessageContact1791400000000 } from '../../src/database/migrations/1791400000000-CreateMessageContact';
import { NotificationMessageContact1791500000000 } from '../../src/database/migrations/1791500000000-NotificationMessageContact';
import { demarrerBaseTest, type BaseTest } from './base-postgres';

export const JWT_SECRET_TEST =
  'secret-de-test-jwt-secret-de-test-32-caracteres';
export const JWT_REFRESH_SECRET_TEST = 'secret-refresh-test-refresh-secret-32c';

export interface ApplicationTest {
  app: INestApplication;
  base: BaseTest;
  dataSource: DataSource;
  /** Applique le seed de demonstration. */
  seed: () => Promise<void>;
  fermer: () => Promise<void>;
}

export async function creerApplicationTest(): Promise<ApplicationTest> {
  const base = await demarrerBaseTest();

  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = base.url;
  process.env.JWT_SECRET = JWT_SECRET_TEST;
  process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET_TEST;
  process.env.MAIL_MODE = 'noop';
  // Le serveur PostgreSQL de test partage une connexion unique en interne :
  // un pool de 1 evite toute execution concurrente de requetes.
  process.env.DB_POOL_MAX = '1';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  process.env.MOT_DE_PASSE_RESET_EXPIRATION_MINUTES = '30';

  // 1. Migrations (le schema teste est celui de production)
  const dataSource = new DataSource({
    type: 'postgres',
    url: base.url,
    entities: ENTITES,
    migrations: [
      InitSchema1791200000000,
      CreatePasswordResetTokens1791292246344,
      CreateMessageContact1791400000000,
      NotificationMessageContact1791500000000,
    ],
    migrationsTableName: 'migrations_typeorm',
    synchronize: false,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();

  // 2. Application NestJS
  //    Chargement paresseux (require) volontaire : les variables
  //    d'environnement doivent etre definies avant les modules Nest.

  const { AppModule } = require('../../src/app.module');
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  // Meme configuration que le point d'entree de production (src/main.ts)
  const app = moduleRef.createNestApplication();
  configurerApplication(app as unknown as NestExpressApplication);
  await app.init();

  return {
    app,
    base,
    dataSource,
    seed: async () => {
      // Meme jeu de donnees que `npm run seed`
      const { executerSeed } = require('../../src/database/seed');
      await executerSeed(dataSource);
    },
    fermer: async () => {
      await app.close();
      if (dataSource.isInitialized) await dataSource.destroy();
      await base.arreter();
    },
  };
}
