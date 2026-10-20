import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { EtablissementResponseDto } from '../etablissements/dto/etablissement-response.dto';
import { AccueilPublicDto } from './dto/accueil-public.dto';
import { PartenairePublicDto } from './dto/partenaire-public.dto';
import { PartenariatPublicDto } from './dto/partenariat-public.dto';
import { ProjetPublicDto } from './dto/projet-public.dto';
import { PublicationPubliqueDto } from './dto/publication-publique.dto';
import { EspacePublicService } from './espace-public.service';

@ApiTags('Espace public')
@Controller('public')
export class EspacePublicController {
  constructor(private readonly espacePublicService: EspacePublicService) {}

  @Get('accueil')
  @Public()
  @ApiOperation({
    summary: 'Obtenir les informations de la page d’accueil publique',
  })
  @ApiResponse({ status: 200, type: AccueilPublicDto })
  getAccueil(): Promise<AccueilPublicDto> {
    return this.espacePublicService.getAccueil();
  }

  @Get('publications')
  @Public()
  @ApiOperation({ summary: 'Lister les publications publiques' })
  @ApiResponse({ status: 200, type: [PublicationPubliqueDto] })
  async listerPublications(): Promise<PublicationPubliqueDto[]> {
    const resultat = await this.espacePublicService.listerPublications();
    return resultat.data;
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

  @Get('etablissements')
  @Public()
  @ApiOperation({ summary: 'Lister les établissements publics' })
  @ApiResponse({ status: 200, type: [EtablissementResponseDto] })
  listerEtablissements() {
    return this.espacePublicService.listerEtablissements();
  }

  @Get('partenaires')
  @Public()
  @ApiOperation({ summary: 'Lister les partenaires visibles publiquement' })
  @ApiResponse({ status: 200, type: [PartenairePublicDto] })
  listerPartenaires(): Promise<PartenairePublicDto[]> {
    return this.espacePublicService.listerPartenaires();
  }

  @Get('projets')
  @Public()
  @ApiOperation({ summary: 'Lister les projets publiés publiquement' })
  @ApiResponse({ status: 200, type: [ProjetPublicDto] })
  listerProjetsPublies(): Promise<ProjetPublicDto[]> {
    return this.espacePublicService.listerProjetsPublies();
  }

  @Get('partenariats')
  @Public()
  @ApiOperation({ summary: 'Lister les partenariats publiés publiquement' })
  @ApiResponse({ status: 200, type: [PartenariatPublicDto] })
  listerPartenariatsPublies(): Promise<PartenariatPublicDto[]> {
    return this.espacePublicService.listerPartenariatsPublies();
  }
}
