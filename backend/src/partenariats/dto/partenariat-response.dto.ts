import { ApiProperty } from '@nestjs/swagger';
import { DomainePartenariat } from '../../common/enums/domaine-partenariat.enum';
import { StatutPartenariat } from '../../common/enums/statut-partenariat.enum';

export class PartenaireSimpleDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  nom: string;
}

export class EtablissementSimpleDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  nom: string;
  @ApiProperty()
  sigle?: string;
}

export class PartenariatResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  intitule: string;

  @ApiProperty()
  objet?: string;

  @ApiProperty({ enum: DomainePartenariat })
  domaine: DomainePartenariat;

  @ApiProperty()
  date_debut: Date;

  @ApiProperty()
  date_fin?: Date;

  @ApiProperty({ enum: StatutPartenariat })
  statut: StatutPartenariat;

  @ApiProperty()
  actions_realisees?: string;

  @ApiProperty()
  actions_en_cours?: string;

  @ApiProperty()
  actions_prevues?: string;

  @ApiProperty()
  resultats_obtenus?: string;

  @ApiProperty()
  difficultes_contraintes?: string;

  @ApiProperty()
  perspectives_recommandations?: string;

  @ApiProperty()
  archive: boolean;

  @ApiProperty({ nullable: true })
  soumis_le: Date | null;

  @ApiProperty({ nullable: true })
  publie_le: Date | null;

  @ApiProperty({ nullable: true })
  cree_par_role: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ type: [EtablissementSimpleDto] })
  etablissements: EtablissementSimpleDto[];

  @ApiProperty({ type: [PartenaireSimpleDto] })
  partenaires: PartenaireSimpleDto[];
}
