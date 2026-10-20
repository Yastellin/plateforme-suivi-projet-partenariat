// backend/src/configuration/configuration.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { StorageModule } from '../storage/storage.module';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Configuration]),
    StorageModule,
    HistoriqueModule,
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
