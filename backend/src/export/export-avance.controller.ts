import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ExportAvanceService } from './export-avance.service';
import type { UtilisateurExport } from './export-avance.service';
import { FiltresExportDto } from './dto/filtres-export.dto';

@ApiTags('Exports')
@ApiBearerAuth()
@Controller('exports')
@Roles(Role.PRESIDENCE)
export class ExportAvanceController {
  constructor(private readonly exportService: ExportAvanceService) {}

  @Post('apercu')
  @ApiOperation({ summary: 'Aperçu des lignes et des fichiers à exporter' })
  @ApiBody({ type: FiltresExportDto })
  @ApiResponse({
    status: 200,
    description: 'Comptage par entité et formats disponibles',
  })
  apercu(@Body() filtres: FiltresExportDto) {
    return this.exportService.apercu(filtres);
  }

  @Post()
  @ApiOperation({ summary: 'Générer et télécharger un export filtré' })
  @ApiBody({ type: FiltresExportDto })
  @ApiResponse({
    status: 200,
    description: 'Fichier exporté en réponse binaire',
  })
  async exporter(
    @Body() filtres: FiltresExportDto,
    @CurrentUser() utilisateur: UtilisateurExport,
    @Res() response: Response,
  ): Promise<void> {
    const { fichier } = await this.exportService.exporter(filtres, utilisateur);
    const nomEncode = encodeURIComponent(fichier.nom);
    response.setHeader('Content-Type', fichier.typeMime);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fichier.nom}"; filename*=UTF-8''${nomEncode}`,
    );
    response.setHeader('Content-Length', fichier.contenu.length);
    response.setHeader('Cache-Control', 'no-store');
    response.status(200).send(fichier.contenu);
  }

  @Get('historique')
  @ApiOperation({ summary: 'Historique paginé des exports réussis' })
  @ApiResponse({
    status: 200,
    description: 'Historique avec les métadonnées de pagination',
  })
  historique(@Query() pagination: PaginationQueryDto) {
    return this.exportService.listerHistorique(
      pagination.page ?? 1,
      pagination.limit ?? 20,
    );
  }
}
