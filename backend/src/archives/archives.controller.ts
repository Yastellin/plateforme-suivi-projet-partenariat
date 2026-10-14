import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import {
  ArchivesService,
  estTypeArchive,
  TypeArchive,
} from './archives.service';
import { QueryArchiveDto } from './dto/query-archive.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Archives')
@ApiBearerAuth()
@Controller('archives')
export class ArchivesController {
  constructor(private archivesService: ArchivesService) {}

  private etablissementDuUser(user: any): string | undefined {
    return user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
  }

  private verifierType(type: string): TypeArchive {
    if (!estTypeArchive(type)) {
      throw new BadRequestException('Type d archive invalide');
    }
    return type;
  }

  @Get('partenaires')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les partenaires archives' })
  @ApiResponse({ status: 200 })
  listerPartenaires(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    return this.archivesService.listerPartenaires(query, this.etablissementDuUser(user));
  }

  @Get('partenariats')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les partenariats archives' })
  @ApiResponse({ status: 200 })
  listerPartenariats(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    return this.archivesService.listerPartenariats(query, this.etablissementDuUser(user));
  }

  @Get('projets')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les projets archives' })
  @ApiResponse({ status: 200 })
  listerProjets(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    return this.archivesService.listerProjets(query, this.etablissementDuUser(user));
  }

  @Get('conventions')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les conventions archivees' })
  @ApiResponse({ status: 200 })
  listerConventions(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    return this.archivesService.listerConventions(query, this.etablissementDuUser(user));
  }

  @Get('cotutelles')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les cotutelles archivees' })
  @ApiResponse({ status: 200 })
  listerCotutelles(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    return this.archivesService.listerCotutelles(query, this.etablissementDuUser(user));
  }

  @Get('documents')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les documents archives' })
  @ApiResponse({ status: 200 })
  listerDocuments(@Query() query: QueryArchiveDto) {
    return this.archivesService.listerDocuments(query);
  }

  @Get(':type/:id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Detail d un element archive' })
  @ApiResponse({ status: 200 })
  detailArchive(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.archivesService.detailArchive(
      this.verifierType(type),
      id,
      this.etablissementDuUser(user),
    );
  }

  @Post(':type/:id/restaurer')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Restaurer un element archive' })
  @ApiResponse({ status: 200 })
  restaurer(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.archivesService.restaurer(
      this.verifierType(type),
      id,
      this.etablissementDuUser(user),
    );
  }
}