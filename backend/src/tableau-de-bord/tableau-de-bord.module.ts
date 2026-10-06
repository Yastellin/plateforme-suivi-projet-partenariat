import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { PartenariatEtablissement } from '../partenariats/entities/partenariat-etablissement.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { Publication } from '../publications/enitities/publication.entity';
import { TableauDeBordController } from './tableau-de-bord.controller';
import { TableauDeBordService } from './tableau-de-bord.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Partenaire,
      Partenariat,
      PartenariatEtablissement,
      CotutelleThese,
      Projet,
      Convention,
      Publication,
    ]),
  ],
  controllers: [TableauDeBordController],
  providers: [TableauDeBordService],
  exports: [TableauDeBordService],
})
export class TableauDeBordModule {}