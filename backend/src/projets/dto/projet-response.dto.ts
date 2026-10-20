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
  soumis_le: Date | null;

  @ApiProperty({ nullable: true })
  publie_le: Date | null;

  @ApiProperty()
  etablissement_id: string;

  @ApiProperty({ nullable: true })
  soumis_le: Date | null;

  @ApiProperty({ nullable: true })
  publie_le: Date | null;

  @ApiProperty({ nullable: true })
  partenariat_id: string | null;

  @ApiProperty({ nullable: true })
  porteur_id: string | null;

  @ApiProperty()
  avancement: number;

  @ApiProperty()
  en_retard: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
