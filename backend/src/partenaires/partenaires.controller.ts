import {
  Controller,
  Get,
  Post,
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
    let etablissementId: string;

    if (user.role === Role.ETABLISSEMENT) {
      etablissementId = user.etablissement_id;
      if (!etablissementId) {
        throw new BadRequestException(
          'Aucun établissement associé à ce compte.',
        );
      }
    } else if (user.role === Role.PRESIDENCE) {
      if (!dto.etablissement_id) {
        throw new BadRequestException(
          "Pour la PRÉSIDENCE, l'ID de l'établissement est requis.",
        );
      }
      etablissementId = dto.etablissement_id;
    } else {
      throw new ForbiddenException('Rôle non autorisé pour cette action.');
    }

    return this.partenairesService.create(etablissementId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les partenaires' })
  @ApiResponse({ status: 200 })
  findAll(@CurrentUser() user: any, @Query() query: QueryPartenaireDto) {
    // Si l'utilisateur est un établissement, on filtre par son ID
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.partenairesService.findAll(query, etablissementId);
  }

  @Get('recherche-doublon')
  @ApiOperation({
    summary: 'Rechercher un partenaire par nom (vérification doublon)',
  })
  @ApiResponse({ status: 200 })
  rechercherDoublon(@CurrentUser() user: any, @Query('nom') nom: string) {
    if (!nom) {
      throw new BadRequestException('Le paramètre nom est requis');
    }

    if (user.role === Role.ETABLISSEMENT) {
      if (!user.etablissement_id) {
        throw new BadRequestException(
          'Aucun établissement associé à ce compte.',
        );
      }
      return this.partenairesService.rechercherDoublon(
        nom,
        user.etablissement_id,
      );
    }

    // PRESIDENCE / DECIDEUR : recherche sur l'ensemble des établissements
    return this.partenairesService.rechercherDoublon(nom, undefined);
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
    return this.partenairesService.update(id, dto, etablissementId);
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
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Soumettre un partenaire à la Présidence' })
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
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({
    summary: 'Soumettre plusieurs partenaires a la Presidence en une fois',
  })
  @ApiResponse({ status: 200 })
  soumettreEnMasse(@CurrentUser() user: any, @Body() dto: { ids: string[] }) {
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
    summary: 'Publier un partenaire soumis (Presidence uniquement)',
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
}
