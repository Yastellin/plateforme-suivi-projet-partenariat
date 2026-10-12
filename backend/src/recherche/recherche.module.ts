import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { RechercheController } from './recherche.controller';
import { RechercheService } from './recherche.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Partenaire,
      Partenariat,
      Projet,
      Convention,
      CotutelleThese,
    ]),
  ],
  controllers: [RechercheController],
  providers: [RechercheService],
  exports: [RechercheService],
})
export class RechercheModule {}
