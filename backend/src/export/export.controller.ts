import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('projets')
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Exporter les projets en PDF ou Excel' })
  @ApiQuery({ name: 'format', required: false, enum: ['pdf', 'xlsx'] })
  @ApiResponse({ status: 200, description: 'Fichier binaire (PDF ou XLSX)' })
  async exporterProjets(
    @Query('format') format: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ): Promise<void> {
    const formatValide = format || 'pdf';
    if (formatValide !== 'pdf' && formatValide !== 'xlsx') {
      throw new BadRequestException('Format invalide. Valeurs acceptees : pdf, xlsx.');
    }

    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;

    const { buffer, nomFichier, mimeType } = await this.exportService.exporterProjets(
      formatValide as 'pdf' | 'xlsx',
      etablissementId,
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${nomFichier}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }

  @Get('conventions')
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Exporter les conventions en PDF ou Excel' })
  @ApiQuery({ name: 'format', required: false, enum: ['pdf', 'xlsx'] })
  @ApiResponse({ status: 200, description: 'Fichier binaire (PDF ou XLSX)' })
  async exporterConventions(
    @Query('format') format: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ): Promise<void> {
    const formatValide = format || 'pdf';
    if (formatValide !== 'pdf' && formatValide !== 'xlsx') {
      throw new BadRequestException('Format invalide. Valeurs acceptees : pdf, xlsx.');
    }

    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;

    const { buffer, nomFichier, mimeType } = await this.exportService.exporterConventions(
      formatValide as 'pdf' | 'xlsx',
      etablissementId,
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${nomFichier}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }
}