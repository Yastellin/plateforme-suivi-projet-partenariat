// backend/src/historique/historique.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriqueAction } from './entities/historique-action.entity';
import { HistoriqueService } from './historique.service';
import { HistoriqueController } from './historique.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistoriqueAction])],
  controllers: [HistoriqueController],
  providers: [HistoriqueService],
  exports: [HistoriqueService],
})
export class HistoriqueModule {}
