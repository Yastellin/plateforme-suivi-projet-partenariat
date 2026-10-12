import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'node:path';
import { ENTITES } from './entites';

config();

// DataSource dedie a la CLI TypeORM (migrations, revert, generate) et au seed.
// Le runtime Nest utilise DatabaseModule (autoLoadEntities).
const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ENTITES,
  // Le CLI tourne via ts-node (*.ts) ; en production le code est compile (*.js).
  migrations: [
    join(__dirname, 'migrations', '*.ts'),
    join(__dirname, 'migrations', '*.js'),
  ],
  migrationsTableName: 'migrations_typeorm',
  synchronize: false,
  logging: false,
});

export default dataSource;
