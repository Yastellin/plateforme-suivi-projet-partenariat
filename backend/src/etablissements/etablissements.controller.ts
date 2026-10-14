import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { EtablissementsService } from './etablissements.service';
import { EtablissementResponseDto } from './dto/etablissement-response.dto';
import { QueryEtablissementDto } from './dto/query-etablissement.dto';

@ApiTags('Établissements')
@ApiBearerAuth()
@Controller('etablissements')
export class EtablissementsController {
  constructor(private etablissementsService: EtablissementsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les établissements (paginé)' })
  @ApiResponse({ status: 200, type: [EtablissementResponseDto] })
  findAll(@Query() query: QueryEtablissementDto) {
    const { page, limit, recherche } = query;
    return this.etablissementsService.findAll(page, limit, recherche);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un établissement par ID' })
  @ApiResponse({ status: 200, type: EtablissementResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EtablissementResponseDto> {
    return this.etablissementsService.findOne(id);
  }
}
