import { Module } from '@nestjs/common';
import { HistoriqueModule } from '../historique/historique.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CotutellesController } from './cotutelles.controller';
import { CotutellesService } from './cotutelles.service';
import { CotutelleThese } from './entities/cotutelle-these.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';

@Module({
  imports: [
    HistoriqueModule,
    TypeOrmModule.forFeature([CotutelleThese, Etablissement, Partenaire]),
  ],
  controllers: [CotutellesController],
  providers: [CotutellesService],
  exports: [CotutellesService],
})
export class CotutellesModule {}
