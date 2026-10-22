import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../documents/entities/document.entity';
import { PhotoPublication } from '../publications/enitities/photo-publication.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Configuration } from '../configuration/entities/configuration.entity';
import { CleanupController } from './cleanup.controller';
import { CleanupService } from './cleanup.service';
import { CleanupSchedulerService } from './cleanup-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      PhotoPublication,
      Partenaire,
      Etablissement,
      Configuration,
    ]),
  ],
  controllers: [CleanupController],
  providers: [CleanupService, CleanupSchedulerService],
  exports: [CleanupService],
})
export class CleanupModule {}
