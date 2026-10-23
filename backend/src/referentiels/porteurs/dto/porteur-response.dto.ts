import { ApiProperty } from '@nestjs/swagger';
import { TypePorteur } from '../../../common/enums/type-porteur.enum';

export class PorteurResponseDto {
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
  etablissement?: { id: string; nom: string; sigle: string | null } | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
