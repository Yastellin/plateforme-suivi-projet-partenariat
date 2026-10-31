import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { PDF_GENERATOR_PORT } from './pdf-generator.port';
import { PdfkitGeneratorAdapter } from './pdf-generator.adapter';
import { EXCEL_GENERATOR_PORT } from './excel-generator.port';
import { ExceljsGeneratorAdapter } from './excel-generator.adapter';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { ExportHistorique } from './entities/export-historique.entity';
import { ExportAvanceController } from './export-avance.controller';
import { ExportAvanceService } from './export-avance.service';
import { GenerateurExportAvanceService } from './generateur-export-avance.service';
import { ConventionExporteur } from './exporteurs/convention-exporteur';
import { ProjetExporteur } from './exporteurs/projet-exporteur';
import { PartenariatExporteur } from './exporteurs/partenariat-exporteur';
import { PartenaireExporteur } from './exporteurs/partenaire-exporteur';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Projet,
      Convention,
      Partenariat,
      Partenaire,
      ExportHistorique,
    ]),
  ],
  controllers: [ExportController, ExportAvanceController],
  providers: [
    ExportService,
    ExportAvanceService,
    GenerateurExportAvanceService,
    ConventionExporteur,
    ProjetExporteur,
    PartenariatExporteur,
    PartenaireExporteur,
    { provide: PDF_GENERATOR_PORT, useClass: PdfkitGeneratorAdapter },
    { provide: EXCEL_GENERATOR_PORT, useClass: ExceljsGeneratorAdapter },
  ],
  exports: [ExportService],
})
export class ExportModule {}
