import { ApiProperty } from '@nestjs/swagger';
import { StatutPartenaire } from '../../common/enums/statut-partenaire.enum';
import { Visibilite } from '../../common/enums/visibilite.enum';

export class ContactResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  nom: string;
  @ApiProperty()
  fonction?: string;
  @ApiProperty()
  email?: string;
  @ApiProperty()
  telephone?: string;
  @ApiProperty({ type: [String] })
  emails?: string[];
  @ApiProperty({ type: [String] })
  telephones?: string[];
}

export class PartenaireResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  nom: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  pays: string;
  @ApiProperty()
  adresse?: string;
  @ApiProperty()
  telephone?: string;
  @ApiProperty()
  email?: string;
  @ApiProperty({ type: [String] })
  emails?: string[];
  @ApiProperty({ type: [String] })
  telephones?: string[];
  @ApiProperty()
  site_web?: string;
  @ApiProperty()
  description?: string;
  @ApiProperty({ enum: StatutPartenaire })
  statut: StatutPartenaire;
  @ApiProperty({ enum: Visibilite })
  visibilite: Visibilite;
  @ApiProperty()
  est_strategique: boolean;
  @ApiProperty()
  logo_url?: string;
  @ApiProperty()
  archive: boolean;
  @ApiProperty({ nullable: true })
  soumis_le: Date | null;
  @ApiProperty({ nullable: true })
  publie_le: Date | null;
  @ApiProperty({ nullable: true })
  cree_par_role: string | null;
  @ApiProperty({ nullable: true })
  etablissement_id: string | null;
  @ApiProperty({ type: [ContactResponseDto] })
  contacts?: ContactResponseDto[];
  @ApiProperty()
  created_at: Date;
  @ApiProperty()
  updated_at: Date;
}
