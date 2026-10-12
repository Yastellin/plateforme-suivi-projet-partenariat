import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { RechercheService } from './recherche.service';
import { QueryRechercheDto } from './dto/query-recherche.dto';
import { RechercheResponseDto } from './dto/recherche-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Recherche')
@ApiBearerAuth()
@Controller('recherche')
export class RechercheController {
  constructor(private rechercheService: RechercheService) {}

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({
    summary:
      'Recherche transverse (partenaires, partenariats, projets, conventions, cotutelles)',
  })
  @ApiResponse({ status: 200, type: RechercheResponseDto })
  rechercher(
    @CurrentUser() user: any,
    @Query() query: QueryRechercheDto,
  ): Promise<RechercheResponseDto> {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : null;
    return this.rechercheService.rechercher(query, user.role, etablissementId);
  }
}
