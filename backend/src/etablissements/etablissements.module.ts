import { Module } from '@nestjs/common';
import { HistoriqueModule } from '../historique/historique.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtablissementsController } from './etablissements.controller';
import { EtablissementsService } from './etablissements.service';
import { Etablissement } from './entities/etablissement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Etablissement]), HistoriqueModule],
  controllers: [EtablissementsController],
  providers: [EtablissementsService],
  exports: [EtablissementsService],
})
export class EtablissementsModule {}
