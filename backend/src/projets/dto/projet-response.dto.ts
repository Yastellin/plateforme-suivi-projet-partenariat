import { ApiProperty } from '@nestjs/swagger';
import { StatutProjet } from '../../common/enums/statut-projet.enum';
import { TypePorteur } from '../../common/enums/type-porteur.enum';

class PorteurProjetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TypePorteur })
  type_porteur: TypePorteur;

  @ApiProperty({ nullable: true })
  nom: string | null;

  @ApiProperty({ nullable: true })
  institution_rattachement: string | null;

  @ApiProperty({ nullable: true })
  etablissement_id: string | null;

  @ApiProperty({ nullable: true })
  etablissement_nom: string | null;
}

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

  @ApiProperty()
  etablissement_id: string;

  @ApiProperty({ nullable: true })
  partenariat_id: string | null;

  @ApiProperty({ nullable: true })
  porteur_id: string | null;

  // Porteur complet : le frontend peut afficher nom, type, institution ou
  // etablissement_nom sans second appel API.
  @ApiProperty({ nullable: true, type: PorteurProjetResponseDto })
  porteur: PorteurProjetResponseDto | null;

  @ApiProperty()
  avancement: number;

  @ApiProperty()
  en_retard: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}