import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { AccueilPublicDto } from './dto/accueil-public.dto';
import { EtablissementPublicDto } from './dto/etablissement-public.dto';
import { PartenairePublicDto } from './dto/partenaire-public.dto';
import { PartenariatPublicDto } from './dto/partenariat-public.dto';
import { ProjetPublicDto } from './dto/projet-public.dto';
import { PublicationPubliqueDto } from './dto/publication-publique.dto';
import {
  PublicEtablissementQueryDto,
  PublicPartenaireQueryDto,
  PublicProjetQueryDto,
  PublicPublicationQueryDto,
} from './dto/public-query.dto';
import { EspacePublicService } from './espace-public.service';

// Toutes les données de l'espace public viennent de la base de données et
// respectent les règles de visibilité (voir EspacePublicService).
@ApiTags('Espace public')
@Controller('public')
export class EspacePublicController {
  constructor(private readonly espacePublicService: EspacePublicService) {}

  @Get('accueil')
  @Public()
  @ApiOperation({
    summary:
      'Données de la page d’accueil publique (compteurs réels, à la une)',
  })
  @ApiResponse({ status: 200, type: AccueilPublicDto })
  getAccueil(): Promise<AccueilPublicDto> {
    return this.espacePublicService.getAccueil();
  }

  @Get('publications')
  @Public()
  @ApiOperation({ summary: 'Publications publiées par la Présidence' })
  listerPublications(@Query() query: PublicPublicationQueryDto) {
    return this.espacePublicService.listerPublications(query);
  }

  @Get('publications/:id')
  @Public()
  @ApiOperation({ summary: 'Obtenir une publication publique' })
  @ApiResponse({ status: 200, type: PublicationPubliqueDto })
  @ApiResponse({ status: 404, description: 'Publication introuvable.' })
  getPublication(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicationPubliqueDto> {
    return this.espacePublicService.getPublication(id);
  }

  @Get('projets')
  @Public()
  @ApiOperation({
    summary: 'Projets de l’Université (hors brouillons et expirés)',
  })
  @ApiResponse({ status: 200, type: [ProjetPublicDto] })
  listerProjets(@Query() query: PublicProjetQueryDto) {
    return this.espacePublicService.listerProjets(query);
  }

  @Get('projets/publies')
  @Public()
  @ApiOperation({
    summary: 'Projets publiés par la Présidence (drapeau publie_le)',
  })
  @ApiResponse({ status: 200, type: [ProjetPublicDto] })
  listerProjetsPublies(): Promise<ProjetPublicDto[]> {
    return this.espacePublicService.listerProjetsPublies();
  }

  @Get('etablissements')
  @Public()
  @ApiOperation({ summary: 'Lister les établissements membres' })
  @ApiResponse({ status: 200, type: [EtablissementPublicDto] })
  listerEtablissements(@Query() query: PublicEtablissementQueryDto) {
    return this.espacePublicService.listerEtablissements(query);
  }

  @Get('partenaires')
  @Public()
  @ApiOperation({
    summary: 'Lister les partenaires visibles publiquement (actifs)',
  })
  @ApiResponse({ status: 200, type: [PartenairePublicDto] })
  listerPartenaires(@Query() query: PublicPartenaireQueryDto) {
    return this.espacePublicService.listerPartenaires(query);
  }

  @Get('partenariats')
  @Public()
  @ApiOperation({ summary: 'Lister les partenariats publiés publiquement' })
  @ApiResponse({ status: 200, type: [PartenariatPublicDto] })
  listerPartenariatsPublies(): Promise<PartenariatPublicDto[]> {
    return this.espacePublicService.listerPartenariatsPublies();
  }
}
