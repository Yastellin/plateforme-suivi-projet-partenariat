import { Module } from '@nestjs/common';
import { HistoriqueModule } from '../historique/historique.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartenariatsController } from './partenariats.controller';
import { PartenariatsService } from './partenariats.service';
import { Partenariat } from './entities/partenariat.entity';
import { PartenariatEtablissement } from './entities/partenariat-etablissement.entity';
import { PartenariatPartenaire } from './entities/partenariat-partenaire.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';

@Module({
  imports: [
    HistoriqueModule,
    TypeOrmModule.forFeature([
      Partenariat,
      PartenariatEtablissement,
      PartenariatPartenaire,
      Etablissement,
      Partenaire,
    ]),
  ],
  controllers: [PartenariatsController],
  providers: [PartenariatsService],
  exports: [PartenariatsService],
})
export class PartenariatsModule {}
