// backend/src/historique/historique.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriqueAction } from './entities/historique-action.entity';
import { HistoriqueService } from './historique.service';
import { HistoriqueController } from './historique.controller';
import { Utilisateur } from '../auth/entities/utilisateur.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoriqueAction, Utilisateur])],
  controllers: [HistoriqueController],
  providers: [HistoriqueService],
  exports: [HistoriqueService],
})
export class HistoriqueModule {}
