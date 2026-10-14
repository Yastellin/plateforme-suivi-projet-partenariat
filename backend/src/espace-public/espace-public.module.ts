import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { Publication } from '../publications/enitities/publication.entity';
import { EspacePublicController } from './espace-public.controller';
import { EspacePublicService } from './espace-public.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Etablissement,
      Partenaire,
      Projet,
      Convention,
      Publication,
    ]),
  ],
  controllers: [EspacePublicController],
  providers: [EspacePublicService],
  exports: [EspacePublicService],
})
export class EspacePublicModule {}
