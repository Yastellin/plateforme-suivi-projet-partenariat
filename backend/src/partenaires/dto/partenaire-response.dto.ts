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
  @ApiProperty()
  etablissement_id: string;
  @ApiProperty({ type: [ContactResponseDto] })
  contacts?: ContactResponseDto[];
  @ApiProperty()
  created_at: Date;
  @ApiProperty()
  updated_at: Date;
}
