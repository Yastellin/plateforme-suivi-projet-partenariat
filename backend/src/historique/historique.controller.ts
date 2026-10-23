// backend/src/historique/historique.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { HistoriqueService } from './historique.service';
import { QueryHistoriqueDto } from './dto/historique-query.dto';
import { HistoriqueActionResponseDto } from './dto/historique-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { ConsultationHistorique } from './historique.service';

@ApiTags('Historique')
@ApiBearerAuth()
@Controller('historique')
@UseGuards()
export class HistoriqueController {
  constructor(private historiqueService: HistoriqueService) {}

  @Get()
  @Roles(Role.PRESIDENCE, Role.DECIDEUR, Role.ETABLISSEMENT)
  @ApiOperation({
    summary:
      "Consulter l'historique des actions (archivage, restauration, soumission, publication)",
  })
  @ApiResponse({ status: 200, type: [HistoriqueActionResponseDto] })
  lister(
    @CurrentUser() utilisateur: ConsultationHistorique,
    @Query() query: QueryHistoriqueDto,
  ) {
    return this.historiqueService.lister(query, utilisateur);
  }
}
