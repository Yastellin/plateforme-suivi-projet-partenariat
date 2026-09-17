import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TableauDeBordService } from './tableau-de-bord.service';
import { TableauDeBordResponseDto } from './dto/tableau-de-bord-response.dto';
import { EcheancierResponseDto } from './dto/echeancier-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Tableau de bord')
@ApiBearerAuth()
@Controller('tableau-de-bord')
export class TableauDeBordController {
  constructor(private tableauDeBordService: TableauDeBordService) {}

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir les indicateurs du tableau de bord' })
  @ApiResponse({ status: 200, type: TableauDeBordResponseDto })
  getTableauDeBord(@CurrentUser() user: any): Promise<TableauDeBordResponseDto> {
    return this.tableauDeBordService.getTableauDeBord(user.role, user.etablissement_id);
  }

  @Get('echeancier')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir l echeancier (conventions et projets en retard)' })
  @ApiResponse({ status: 200, type: EcheancierResponseDto })
  getEcheancier(@CurrentUser() user: any): Promise<EcheancierResponseDto> {
    const etablissementId = user.role === Role.ETABLISSEMENT ? user.etablissement_id : null;
    return this.tableauDeBordService.getEcheancier(etablissementId);
  }
}