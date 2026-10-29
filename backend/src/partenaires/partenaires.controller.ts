import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import {
  BadRequestException,
  ForbiddenException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PartenairesService } from './partenaires.service';
import { CreatePartenaireDto } from './dto/create-partenaire.dto';
import { UpdatePartenaireDto } from './dto/update-partenaire.dto';
import { QueryPartenaireDto } from './dto/query-partenaire.dto';
import { PartenaireResponseDto } from './dto/partenaire-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { OwnEtablissementGuard } from '../common/guards/own-etablissement.guard';
import { Role } from '../common/enums/role.enum';
import { SoumissionMasseDto } from '../common/dto/soumission-masse.dto';
import { RechercheDoublonPartenaireDto } from './dto/recherche-doublon-partenaire.dto';
import { determinerPerimetreListe } from '../common/utils/perimetre-liste';

@ApiTags('Partenaires')
@ApiBearerAuth()
@Controller('partenaires')
@UseGuards(OwnEtablissementGuard)
export class PartenairesController {
  constructor(private partenairesService: PartenairesService) {}

  @Post()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Créer un partenaire' })
  @ApiResponse({ status: 201, type: PartenaireResponseDto })
  create(@CurrentUser() user: any, @Body() dto: CreatePartenaireDto) {
    let etablissementId: string | null;

    if (user.role === Role.ETABLISSEMENT) {
      etablissementId = user.etablissement_id;
      if (!etablissementId) {
        throw new BadRequestException(
          'Aucun établissement associé à ce compte.',
        );
      }
    } else if (user.role === Role.PRESIDENCE) {
      etablissementId = null;
    } else {
      throw new ForbiddenException('Rôle non autorisé pour cette action.');
    }

    return this.partenairesService.create(etablissementId, dto, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les partenaires' })
  @ApiResponse({ status: 200 })
  findAll(@CurrentUser() user: any, @Query() query: QueryPartenaireDto) {
    const perimetre = determinerPerimetreListe(user, query.etablissement_id);
    return this.partenairesService.findAll(query, perimetre);
  }

  @Get('recherche-doublon')
  @ApiOperation({
    summary: 'Détecter un doublon par identité, e-mail ou téléphone',
    description:
      'Identité bloquante : même nom normalisé + même pays + même établissement. E-mails et téléphones sont uniques globalement.',
  })
  @ApiResponse({ status: 200 })
  rechercherDoublon(
    @CurrentUser() user: any,
    @Query() criteres: RechercheDoublonPartenaireDto,
  ) {
    if (!criteres.nom && !criteres.email && !criteres.telephone) {
      throw new BadRequestException(
        'Indiquez au moins un nom, un e-mail ou un numéro de téléphone.',
      );
    }
    const etablissementId =
      user.role === Role.ETABLISSEMENT
        ? user.etablissement_id
        : criteres.etablissement_id;
    return this.partenairesService.rechercherDoublon(criteres, etablissementId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un partenaire par ID' })
  @ApiResponse({ status: 200, type: PartenaireResponseDto })
  findOne(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.partenairesService.findOne(id, etablissementId);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Mettre à jour un partenaire' })
  @ApiResponse({ status: 200, type: PartenaireResponseDto })
  update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartenaireDto,
  ) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.partenairesService.update(id, dto, etablissementId, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Post(':id/archiver')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Archiver un partenaire (Présidence uniquement)' })
  @ApiResponse({ status: 200 })
  archiver(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.partenairesService.archiver(id, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Post(':id/soumettre')
  @HttpCode(200)
  @Roles(Role.ETABLISSEMENT)
  @ApiOperation({
    summary: 'Soumettre un partenaire à la Présidence (établissement)',
  })
  @ApiResponse({ status: 200, type: PartenaireResponseDto })
  soumettre(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.partenairesService.soumettre(id, etablissementId, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Post('soumettre')
  @HttpCode(200)
  @Roles(Role.ETABLISSEMENT)
  @ApiOperation({
    summary:
      'Soumettre plusieurs partenaires à la Présidence en une fois (établissement)',
  })
  @ApiResponse({ status: 200 })
  soumettreEnMasse(@CurrentUser() user: any, @Body() dto: SoumissionMasseDto) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.partenairesService.soumettreEnMasse(
      dto.ids ?? [],
      etablissementId,
      { id: user.id, email: user.email, role: user.role },
    );
  }

  @Post(':id/publier')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary:
      'Rendre un partenaire visible sur la vitrine (Présidence uniquement)',
  })
  @ApiResponse({ status: 200, type: PartenaireResponseDto })
  publier(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.partenairesService.publier(id, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Post(':id/logo')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @UseInterceptors(
    FileInterceptor('fichier', {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Le logo doit etre une image'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Televerser le logo d un partenaire' })
  @ApiResponse({ status: 200, type: PartenaireResponseDto })
  televerserLogo(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() fichier: Express.Multer.File,
  ) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.partenairesService.televerserLogo(
      id,
      fichier,
      etablissementId,
      { id: user.id, email: user.email, role: user.role },
    );
  }

  @Delete(':id/logo')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Retirer le logo d’un partenaire' })
  @ApiResponse({ status: 200, type: PartenaireResponseDto })
  retirerLogo(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.partenairesService.retirerLogo(
      id,
      etablissementId,
      { id: user.id, email: user.email, role: user.role },
    );
  }
}
