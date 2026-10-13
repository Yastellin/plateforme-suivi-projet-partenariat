import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { EtablissementsService } from './etablissements.service';
import { EtablissementResponseDto } from './dto/etablissement-response.dto';

@ApiTags('Établissements')
@ApiBearerAuth()
@Controller('etablissements')
export class EtablissementsController {
  constructor(private etablissementsService: EtablissementsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les établissements' })
  @ApiResponse({ status: 200, type: [EtablissementResponseDto] })
  findAll(): Promise<EtablissementResponseDto[]> {
    return this.etablissementsService.findAll();
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
