import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PorteursController } from './porteurs/porteurs.controller';
import { PorteursService } from './porteurs/porteurs.service';
import { BailleursController } from './bailleurs/bailleurs.controller';
import { BailleursService } from './bailleurs/bailleurs.service';
import { BeneficiairesController } from './beneficiaires/beneficiaires.controller';
import { BeneficiairesService } from './beneficiaires/beneficiaires.service';
import { SitesController } from './sites/sites.controller';
import { SitesService } from './sites/sites.service';
import { Porteur } from './porteurs/entities/porteur.entity';
import { Bailleur } from './bailleurs/entities/bailleur.entity';
import { Beneficiaire } from './beneficiaires/entities/beneficiaire.entity';
import { Site } from './sites/entities/site.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Porteur, Bailleur, Beneficiaire, Site, Etablissement])],
  controllers: [
    PorteursController,
    BailleursController,
    BeneficiairesController,
    SitesController,
  ],
  providers: [
    PorteursService,
    BailleursService,
    BeneficiairesService,
    SitesService,
  ],
  exports: [
    PorteursService,
    BailleursService,
    BeneficiairesService,
    SitesService,
  ],
})
export class ReferentielsModule {}
