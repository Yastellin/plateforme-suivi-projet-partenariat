import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StatistiquesService } from './statistiques.service';
import { ComparatifEtablissementsResponseDto } from './dto/comparatif-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Statistiques')
@ApiBearerAuth()
@Controller('statistiques')
export class StatistiquesController {
  constructor(private statistiquesService: StatistiquesService) {}

  @Get('comparatif-etablissements')
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Comparatif des statistiques par etablissement' })
  @ApiResponse({ status: 200, type: ComparatifEtablissementsResponseDto })
  comparatifEtablissements(): Promise<ComparatifEtablissementsResponseDto> {
    return this.statistiquesService.comparatifEtablissements();
  }
}