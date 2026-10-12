import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { PartenariatEtablissement } from '../partenariats/entities/partenariat-etablissement.entity';
import { Projet } from '../projets/entities/projet.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { StatistiquesController } from './statistiques.controller';
import { StatistiquesService } from './statistiques.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Etablissement,
      Partenaire,
      Partenariat,
      PartenariatEtablissement,
      Projet,
      CotutelleThese,
    ]),
  ],
  controllers: [StatistiquesController],
  providers: [StatistiquesService],
  exports: [StatistiquesService],
})
export class StatistiquesModule {}
