import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ArchivesService } from './archives.service';
import { QueryArchiveDto } from './dto/query-archive.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Archives')
@ApiBearerAuth()
@Controller('archives')
export class ArchivesController {
  constructor(private archivesService: ArchivesService) {}

  @Get('partenaires')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les partenaires archives' })
  @ApiResponse({ status: 200 })
  listerPartenaires(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.archivesService.listerPartenaires(query, etablissementId);
  }

  @Get('partenariats')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les partenariats archives' })
  @ApiResponse({ status: 200 })
  listerPartenariats(
    @CurrentUser() user: any,
    @Query() query: QueryArchiveDto,
  ) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.archivesService.listerPartenariats(query, etablissementId);
  }

  @Get('projets')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les projets archives' })
  @ApiResponse({ status: 200 })
  listerProjets(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.archivesService.listerProjets(query, etablissementId);
  }

  @Get('conventions')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les conventions archivees' })
  @ApiResponse({ status: 200 })
  listerConventions(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.archivesService.listerConventions(query, etablissementId);
  }

  @Get('cotutelles')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les cotutelles archivees' })
  @ApiResponse({ status: 200 })
  listerCotutelles(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.archivesService.listerCotutelles(query, etablissementId);
  }
}
