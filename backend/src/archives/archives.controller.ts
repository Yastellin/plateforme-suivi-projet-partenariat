import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  BadRequestException,
  HttpCode,
  Res,
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
import { HistoriqueService } from '../historique/historique.service';
import { DocumentsService } from '../documents/documents.service';
import type { Response } from 'express';

const TYPE_HISTORIQUE: Record<TypeArchive, string> = {
  partenaires: 'Partenaire',
  partenariats: 'Partenariat',
  projets: 'Projet',
  conventions: 'Convention',
  cotutelles: 'CotutelleThese',
  documents: 'Document',
};

@ApiTags('Archives')
@ApiBearerAuth()
@Controller('archives')
export class ArchivesController {
  constructor(
    private archivesService: ArchivesService,
    private historiqueService: HistoriqueService,
    private documentsService: DocumentsService,
  ) {}

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
    return this.archivesService.listerPartenaires(
      query,
      this.etablissementDuUser(user),
    );
  }

  @Get('partenariats')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les partenariats archives' })
  @ApiResponse({ status: 200 })
  listerPartenariats(
    @CurrentUser() user: any,
    @Query() query: QueryArchiveDto,
  ) {
    return this.archivesService.listerPartenariats(
      query,
      this.etablissementDuUser(user),
    );
  }

  @Get('projets')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les projets archives' })
  @ApiResponse({ status: 200 })
  listerProjets(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    return this.archivesService.listerProjets(
      query,
      this.etablissementDuUser(user),
    );
  }

  @Get('conventions')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les conventions archivees' })
  @ApiResponse({ status: 200 })
  listerConventions(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    return this.archivesService.listerConventions(
      query,
      this.etablissementDuUser(user),
    );
  }

  @Get('cotutelles')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les cotutelles archivees' })
  @ApiResponse({ status: 200 })
  listerCotutelles(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    return this.archivesService.listerCotutelles(
      query,
      this.etablissementDuUser(user),
    );
  }

  @Get('documents')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les documents archives' })
  @ApiResponse({ status: 200 })
  listerDocuments(@CurrentUser() user: any, @Query() query: QueryArchiveDto) {
    return this.archivesService.listerDocuments(
      query,
      this.etablissementDuUser(user),
    );
  }

  @Get('documents/:id/telecharger')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Télécharger un document archivé autorisé' })
  async telechargerDocumentArchive(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ): Promise<void> {
    await this.archivesService.detailArchive(
      'documents',
      id,
      this.etablissementDuUser(user),
    );
    const { chemin, nom } = await this.documentsService.telecharger(id, true);
    res.download(chemin, nom);
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

  @Get(':type/:id/historique')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: "Consulter l'historique d'un élément archivé" })
  async historiqueArchive(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const typeValide = this.verifierType(type);
    // Réutilise le contrôle d'accès du détail avant d'exposer son historique.
    await this.archivesService.detailArchive(
      typeValide,
      id,
      this.etablissementDuUser(user),
    );
    return this.historiqueService.listerEntite(TYPE_HISTORIQUE[typeValide], id);
  }

  @Post(':type/:id/restaurer')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
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
      { id: user.id, email: user.email, role: user.role },
    );
  }
}
