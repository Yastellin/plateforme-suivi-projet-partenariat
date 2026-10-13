import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { Projet } from '../projets/entities/projet.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { SyntheseItem } from './entities/synthese-item.entity';
import { SynthesePartenaireStrategique } from './entities/synthese-partenaire-strategique.entity';
import { SyntheseController } from './synthese.controller';
import { SyntheseService } from './synthese.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SyntheseItem,
      SynthesePartenaireStrategique,
      Etablissement,
      Partenaire,
      Convention,
      Projet,
      CotutelleThese,
    ]),
  ],
  controllers: [SyntheseController],
  providers: [SyntheseService],
  exports: [SyntheseService],
})
export class SyntheseModule {}
