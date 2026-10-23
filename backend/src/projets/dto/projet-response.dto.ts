import { ApiProperty } from '@nestjs/swagger';
import { StatutProjet } from '../../common/enums/statut-projet.enum';

export class ProjetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiProperty({ nullable: true })
  intitule_officiel: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty({ nullable: true })
  domaine: string | null;

  @ApiProperty({ nullable: true })
  budget: number | null;

  @ApiProperty()
  date_debut: Date;

  @ApiProperty()
  date_fin_prevue: Date;

  @ApiProperty({ enum: StatutProjet })
  statut: StatutProjet;

  @ApiProperty()
  archive: boolean;

  @ApiProperty({ nullable: true })
  etablissement_id: string | null;

  @ApiProperty({ nullable: true })
  soumis_le: Date | null;

  @ApiProperty({ nullable: true })
  publie_le: Date | null;

  @ApiProperty({ nullable: true })
  cree_par_role: string | null;

  @ApiProperty({ nullable: true })
  partenariat_id: string | null;

  @ApiProperty({ nullable: true })
  porteur_id: string | null;

  @ApiProperty({ nullable: true })
  etablissement: unknown;

  @ApiProperty({ nullable: true })
  partenariat: unknown;

  @ApiProperty({ nullable: true })
  porteur: unknown;

  @ApiProperty({ type: [Object] })
  partenaires: unknown[];

  @ApiProperty({ type: [Object] })
  bailleurs: unknown[];

  @ApiProperty({ type: [Object] })
  beneficiaires: unknown[];

  @ApiProperty({ type: [Object] })
  sites: unknown[];

  @ApiProperty()
  en_retard: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
