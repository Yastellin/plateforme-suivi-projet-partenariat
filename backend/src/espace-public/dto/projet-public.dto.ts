import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartenairePublicDto } from './partenaire-public.dto';

export class EtablissementRefPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiProperty({ nullable: true })
  sigle: string | null;
}

// Projet de l'Université visible publiquement. Le budget, les contacts et
// les documents ne sont jamais exposés. La description est celle de la
// publication lorsqu'elle est publiée, sinon null.
export class ProjetPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiPropertyOptional({ nullable: true })
  intitule_officiel: string | null;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional({ nullable: true })
  domaine: string | null;

  @ApiProperty()
  statut: string;

  @ApiProperty()
  date_debut: Date;

  @ApiProperty()
  date_fin_prevue: Date;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  publication_id: string | null;

  @ApiPropertyOptional({ type: EtablissementRefPublicDto, nullable: true })
  etablissement: EtablissementRefPublicDto | null;

  // Repris du mapping "projets publies" (publie_le) de la branche arena.
  @ApiPropertyOptional({ nullable: true })
  etablissement_nom?: string | null;

  @ApiPropertyOptional({ nullable: true })
  etablissement_sigle?: string | null;

  @ApiProperty({ type: [PartenairePublicDto] })
  partenaires: PartenairePublicDto[];
}
