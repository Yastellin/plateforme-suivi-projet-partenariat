import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENTITES } from './entites';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: ENTITES,
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
        // Taille du pool de connexions PostgreSQL (10 par defaut).
        extra: {
          max: Number.parseInt(process.env.DB_POOL_MAX ?? '10', 10),
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
