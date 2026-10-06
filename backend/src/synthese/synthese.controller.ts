import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateSyntheseItemDto } from './dto/create-synthese-item.dto';
import { CreateSynthesePartenaireStrategiqueDto } from './dto/create-synthese-partenaire-strategique.dto';
import { SyntheseService } from './synthese.service';

@ApiTags('Synthese')
@ApiBearerAuth()
@Controller('synthese')
export class SyntheseController {
  constructor(private readonly syntheseService: SyntheseService) {}

  @Get()
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir la synthèse globale' })
  getSyntheseGlobale(@CurrentUser() _user: any, @Query('annee') annee?: string) {
    return this.syntheseService.getSyntheseGlobale(this.parseAnnee(annee));
  }

  @Get('items')
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les items de synthèse' })
  listerItems(
    @CurrentUser() _user: any,
    @Query('etablissement_id') etablissement_id?: string,
    @Query('annee') annee?: string,
    @Query('type') type?: string,
  ) {
    return this.syntheseService.listerItems({
      etablissement_id,
      annee: annee === undefined ? undefined : this.parseAnnee(annee),
      type,
    });
  }

  @Get('partenaires-strategiques')
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les partenaires stratégiques' })
  listerPartenairesStrategiques(
    @CurrentUser() _user: any,
    @Query('etablissement_id') etablissement_id?: string,
    @Query('annee') annee?: string,
  ) {
    return this.syntheseService.listerPartenairesStrategiques({
      etablissement_id,
      annee: annee === undefined ? undefined : this.parseAnnee(annee),
    });
  }

  @Get(':etablissementId')
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir la synthèse d’un établissement' })
  getSyntheseEtablissement(
    @CurrentUser() _user: any,
    @Param('etablissementId', ParseUUIDPipe) etablissementId: string,
    @Query('annee') annee?: string,
  ) {
    return this.syntheseService.getSyntheseEtablissement(
      etablissementId,
      this.parseAnnee(annee),
    );
  }

  @Post('items')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Créer un item de synthèse' })
  creerItem(@CurrentUser() _user: any, @Body() dto: CreateSyntheseItemDto) {
    return this.syntheseService.creerItem(dto);
  }

  @Post('partenaires-strategiques')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Désigner un partenaire stratégique' })
  creerPartenaireStrategique(
    @CurrentUser() _user: any,
    @Body() dto: CreateSynthesePartenaireStrategiqueDto,
  ) {
    return this.syntheseService.creerPartenaireStrategique(dto);
  }

  @Delete('items/:id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Supprimer un item de synthèse' })
  supprimerItem(@CurrentUser() _user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.syntheseService.supprimerItem(id);
  }

  @Delete('partenaires-strategiques/:id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Supprimer un partenaire stratégique' })
  supprimerPartenaireStrategique(
    @CurrentUser() _user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.syntheseService.supprimerPartenaireStrategique(id);
  }

  private parseAnnee(annee?: string): number {
    if (annee === undefined) {
      return new Date().getFullYear();
    }

    const parsed = Number(annee);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException('L’année doit être un nombre entier.');
    }
    return parsed;
  }
}