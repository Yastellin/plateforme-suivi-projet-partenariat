import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';
import { AvancementService } from './avancement.service';
import { Projet } from './entities/projet.entity';
import { ProjetPartenaire } from './entities/projet-partenaire.entity';
import { ProjetBeneficiaire } from './entities/projet-beneficiaire.entity';
import { ProjetBailleur } from './entities/projet-bailleur.entity';
import { ProjetSite } from './entities/projet-site.entity';
import { Activite } from './entities/activite.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Projet,
      ProjetPartenaire,
      ProjetBeneficiaire,
      ProjetBailleur,
      ProjetSite,
      Activite,
      Etablissement,
      Partenariat,
    ]),
  ],
  controllers: [ProjetsController],
  providers: [ProjetsService, AvancementService],
  exports: [ProjetsService, AvancementService],
})
export class ProjetsModule {}