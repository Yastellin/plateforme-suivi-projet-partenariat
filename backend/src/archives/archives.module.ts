import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { ArchivesController } from './archives.controller';
import { ArchivesService } from './archives.service';

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
  controllers: [ArchivesController],
  providers: [ArchivesService],
  exports: [ArchivesService],
})
export class ArchivesModule {}
