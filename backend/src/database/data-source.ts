import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'node:path';

config();

// DataSource dedie a la CLI TypeORM (migrations, revert, generate).
// Le runtime Nest utilise DatabaseModule (autoLoadEntities).
const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, '..', '**', '*.entity.ts')],
  migrations: [join(__dirname, 'migrations', '*.ts')],
  migrationsTableName: 'migrations_typeorm',
  synchronize: false,
  logging: false,
});

export default dataSource;