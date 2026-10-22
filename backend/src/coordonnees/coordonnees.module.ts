import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coordonnee } from './entities/coordonnee.entity';
import { CoordonneesService } from './coordonnees.service';

@Module({
  imports: [TypeOrmModule.forFeature([Coordonnee])],
  providers: [CoordonneesService],
  exports: [CoordonneesService, TypeOrmModule],
})
export class CoordonneesModule {}
