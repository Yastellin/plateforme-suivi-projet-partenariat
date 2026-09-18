import { Module } from '@nestjs/common';
import { PorteursController } from './porteurs/porteurs.controller';
import { PorteursService } from './porteurs/porteurs.service';
import { BailleursController } from './bailleurs/bailleurs.controller';
import { BailleursService } from './bailleurs/bailleurs.service';
import { BeneficiairesController } from './beneficiaires/beneficiaires.controller';
import { BeneficiairesService } from './beneficiaires/beneficiaires.service';
import { SitesController } from './sites/sites.controller';
import { SitesService } from './sites/sites.service';

@Module({
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