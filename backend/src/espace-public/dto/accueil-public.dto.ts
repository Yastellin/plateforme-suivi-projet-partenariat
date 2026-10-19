import { ApiProperty } from '@nestjs/swagger';
import { EtablissementPublicDto } from './etablissement-public.dto';
import { PartenairePublicDto } from './partenaire-public.dto';
import { ProjetPublicDto } from './projet-public.dto';
import { PublicationPubliqueDto } from './publication-publique.dto';

// Compteurs calculés sur la base de données (aucune valeur codée en dur).
export class CompteursPublicsDto {
  @ApiProperty({ description: 'Établissements membres' })
  nombre_etablissements: number;

  @ApiProperty({ description: 'Partenaires actifs et visibles publiquement' })
  nombre_partenaires: number;

  @ApiProperty({ description: 'Pays distincts des partenaires visibles' })
  nombre_pays_partenaires: number;

  @ApiProperty({ description: 'Projets en cours ou en attente' })
  nombre_projets_actifs: number;

  @ApiProperty({ description: 'Publications publiées par la Présidence' })
  nombre_publications: number;

  @ApiProperty({ description: 'Conventions signées ou actives' })
  nombre_conventions_actives: number;
}

export class AccueilPublicDto {
  @ApiProperty({ type: CompteursPublicsDto })
  compteurs: CompteursPublicsDto;

  @ApiProperty({ type: [PublicationPubliqueDto] })
  dernieres_publications: PublicationPubliqueDto[];

  @ApiProperty({ type: [ProjetPublicDto] })
  projets_a_la_une: ProjetPublicDto[];

  @ApiProperty({ type: [PartenairePublicDto] })
  partenaires_a_la_une: PartenairePublicDto[];

  @ApiProperty({ type: [EtablissementPublicDto] })
  etablissements_a_la_une: EtablissementPublicDto[];
}
