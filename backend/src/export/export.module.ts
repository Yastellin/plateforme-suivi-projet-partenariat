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

@Module({
  imports: [TypeOrmModule.forFeature([Projet, Convention])],
  controllers: [ExportController],
  providers: [
    ExportService,
    { provide: PDF_GENERATOR_PORT, useClass: PdfkitGeneratorAdapter },
    { provide: EXCEL_GENERATOR_PORT, useClass: ExceljsGeneratorAdapter },
  ],
  exports: [ExportService],
})
export class ExportModule {}