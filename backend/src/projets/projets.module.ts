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
import { HistoriqueModule } from '../historique/historique.module';
import { Porteur } from '../referentiels/porteurs/entities/porteur.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Beneficiaire } from '../referentiels/beneficiaires/entities/beneficiaire.entity';
import { Bailleur } from '../referentiels/bailleurs/entities/bailleur.entity';
import { Site } from '../referentiels/sites/entities/site.entity';

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
      Porteur,
      Partenaire,
      Beneficiaire,
      Bailleur,
      Site,
    ]),
    HistoriqueModule,
  ],
  controllers: [ProjetsController],
  providers: [ProjetsService, AvancementService],
  exports: [ProjetsService, AvancementService],
})
export class ProjetsModule {}
