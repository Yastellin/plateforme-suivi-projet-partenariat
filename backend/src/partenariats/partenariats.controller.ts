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
  HttpCode,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PartenariatsService } from './partenariats.service';
import { CreatePartenariatDto } from './dto/create-partenariat.dto';
import { UpdatePartenariatDto } from './dto/update-partenariat.dto';
import { QueryPartenariatDto } from './dto/query-partenariat.dto';
import { PartenariatResponseDto } from './dto/partenariat-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { OwnEtablissementGuard } from '../common/guards/own-etablissement.guard';

@ApiTags('Partenariats')
@ApiBearerAuth()
@Controller('partenariats')
@UseGuards(OwnEtablissementGuard)
export class PartenariatsController {
  constructor(private partenariatsService: PartenariatsService) {}

  @Post()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Créer un partenariat' })
  @ApiResponse({ status: 201, type: PartenariatResponseDto })
  create(@CurrentUser() user: any, @Body() dto: CreatePartenariatDto) {
    let etablissementId: string;

    if (user.role === Role.ETABLISSEMENT) {
      etablissementId = user.etablissement_id;
      if (!etablissementId) {
        throw new BadRequestException(
          'Aucun établissement associé à ce compte.',
        );
      }
      // L'établissement qui crée doit être dans la liste des établissements associés (RG06)
      if (!dto.etablissements_ids.includes(etablissementId)) {
        throw new BadRequestException(
          "L'établissement connecté doit être dans la liste des établissements associés.",
        );
      }
    } else if (user.role === Role.PRESIDENCE) {
      if (!dto.etablissements_ids || dto.etablissements_ids.length === 0) {
        throw new BadRequestException('Au moins un établissement est requis.');
      }
      etablissementId = dto.etablissements_ids[0]; // Pour le rattachement principal
    } else {
      throw new ForbiddenException('Rôle non autorisé pour cette action.');
    }

    return this.partenariatsService.create(etablissementId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les partenariats' })
  @ApiResponse({ status: 200 })
  findAll(@CurrentUser() user: any, @Query() query: QueryPartenariatDto) {
    let etablissementId: string | undefined;
    if (user.role === Role.ETABLISSEMENT) {
      etablissementId = user.etablissement_id;
    }
    return this.partenariatsService.findAll(query, etablissementId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un partenariat par ID' })
  @ApiResponse({ status: 200, type: PartenariatResponseDto })
  findOne(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    // includeArchived reste a false : un element archive n'est pas accessible
    // via GET /:id, il faut passer par GET /?archive=true ou /archives/...
    return this.partenariatsService.findOne(id, etablissementId, false);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Mettre à jour un partenariat' })
  @ApiResponse({ status: 200, type: PartenariatResponseDto })
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartenariatDto,
  ) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.partenariatsService.update(id, dto, etablissementId, user.role);
  }

  @Post(':id/soumettre')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Soumettre un partenariat à la Présidence' })
  @ApiResponse({ status: 200, type: PartenariatResponseDto })
  soumettre(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    const etablissementId =
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
    return this.partenariatsService.soumettre(id, etablissementId);
  }

  @Post(':id/archiver')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Archiver un partenariat (Présidence uniquement)' })
  @ApiResponse({ status: 200, type: PartenariatResponseDto })
  archiver(@Param('id', ParseUUIDPipe) id: string) {
    return this.partenariatsService.archiver(id);
  }
}
