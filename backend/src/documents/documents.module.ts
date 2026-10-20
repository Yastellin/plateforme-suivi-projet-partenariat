import { Module } from '@nestjs/common';
import { HistoriqueModule } from '../historique/historique.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';

@Module({
  imports: [
    HistoriqueModule,
    TypeOrmModule.forFeature([
      Document,
      Projet,
      Convention,
      CotutelleThese,
      Partenariat,
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
