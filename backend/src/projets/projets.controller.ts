import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ProjetsService } from './projets.service';
import { CreateProjetDto } from './dto/create-projet.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';
import { QueryProjetDto } from './dto/query-projet.dto';
import { ProjetResponseDto } from './dto/projet-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { OwnEtablissementGuard } from '../common/guards/own-etablissement.guard';
import { SoumissionMasseDto } from '../common/dto/soumission-masse.dto';
import { DemanderModificationProjetDto } from './dto/demander-modification-projet.dto';
import { DemandesModificationProjetService } from './demandes-modification-projet.service';
import { DecisionDemandeModificationProjet } from './demandes-modification-projet.constants';
import { determinerPerimetreListe } from '../common/utils/perimetre-liste';

@ApiTags('Projets')
@ApiBearerAuth()
@Controller('projets')
@UseGuards(OwnEtablissementGuard)
export class ProjetsController {
  constructor(
    private projetsService: ProjetsService,
    private demandesModification: DemandesModificationProjetService,
  ) {}

  @Post()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Créer un projet' })
  @ApiResponse({ status: 201, type: ProjetResponseDto })
  create(@CurrentUser() user: any, @Body() dto: CreateProjetDto) {
    let etablissementId: string | null;
    if (user.role === Role.ETABLISSEMENT) {
      etablissementId = user.etablissement_id;
      if (!etablissementId) {
        throw new BadRequestException(
          'Aucun établissement associé à ce compte.',
        );
      }
    } else if (user.role === Role.PRESIDENCE) {
      // La Presidence peut creer des projets sans etablissement (projets
      // transversaux) : le token n'ecrase rien, le DTO fait foi.
      etablissementId = dto.etablissement_id ?? null;
    } else {
      throw new ForbiddenException('Rôle non autorisé pour cette action.');
    }
    return this.projetsService.create(etablissementId, dto, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lister les projets' })
  findAll(@CurrentUser() user: any, @Query() query: QueryProjetDto) {
    const perimetre = determinerPerimetreListe(user, query.etablissement_id);
    return this.projetsService.findAll(query, perimetre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un projet par ID' })
  @ApiResponse({ status: 200, type: ProjetResponseDto })
  findOne(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.projetsService.findOne(id, etablissementId);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Mettre à jour un projet' })
  @ApiResponse({ status: 200, type: ProjetResponseDto })
  update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjetDto,
  ) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.projetsService.update(id, dto, user.role, etablissementId);
  }

  @Post(':id/demander-modification')
  @HttpCode(200)
  @Roles(Role.ETABLISSEMENT)
  @ApiOperation({
    summary: "Demander à la Présidence la réouverture d'un projet",
  })
  demanderModification(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DemanderModificationProjetDto,
  ) {
    return this.demandesModification.demander(
      id,
      dto.motif,
      user.etablissement_id,
      { id: user.id, email: user.email, role: user.role },
    );
  }

  @Post(':id/demande-modification/approuver')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Approuver la réouverture demandée par un établissement',
  })
  approuverDemandeModification(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.demandesModification.traiter(
      id,
      DecisionDemandeModificationProjet.APPROUVEE,
      { id: user.id, email: user.email, role: user.role },
    );
  }

  @Post(':id/demande-modification/rejeter')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Rejeter la réouverture demandée par un établissement',
  })
  rejeterDemandeModification(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.demandesModification.traiter(
      id,
      DecisionDemandeModificationProjet.REJETEE,
      { id: user.id, email: user.email, role: user.role },
    );
  }

  @Post(':id/soumettre')
  @HttpCode(200)
  @Roles(Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Soumettre un projet à la Présidence (établissement)' })
  @ApiResponse({ status: 200, type: ProjetResponseDto })
  soumettre(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.projetsService.soumettre(id, etablissementId, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Post('soumettre')
  @HttpCode(200)
  @Roles(Role.ETABLISSEMENT)
  @ApiOperation({
    summary: 'Soumettre plusieurs projets à la Présidence en une fois (établissement)',
  })
  @ApiResponse({ status: 200 })
  soumettreEnMasse(
    @CurrentUser() user: any,
    @Body() dto: SoumissionMasseDto,
  ) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.projetsService.soumettreEnMasse(
      dto.ids ?? [],
      etablissementId,
      { id: user.id, email: user.email, role: user.role },
    );
  }

  @Post(':id/publier')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Publier un projet soumis (Presidence uniquement)',
  })
  @ApiResponse({ status: 200, type: ProjetResponseDto })
  publier(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.projetsService.publier(id, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Post(':id/archiver')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Archiver un projet (Présidence uniquement)' })
  @ApiResponse({ status: 200, type: ProjetResponseDto })
  archiver(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.projetsService.archiver(id, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
