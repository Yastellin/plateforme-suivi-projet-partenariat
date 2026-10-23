import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from '../auth/entities/utilisateur.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { HistoriqueModule } from '../historique/historique.module';
import { CompteController, UtilisateursController } from './utilisateurs.controller';
import { UtilisateursService } from './utilisateurs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Utilisateur, RefreshToken, Etablissement]),
    HistoriqueModule,
  ],
  controllers: [CompteController, UtilisateursController],
  providers: [UtilisateursService],
  exports: [UtilisateursService],
})
export class UtilisateursModule {}
