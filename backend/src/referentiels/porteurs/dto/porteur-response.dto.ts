// backend/src/referentiels/porteurs/dto/porteur-response.dto.ts
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

  // Nom de l'etablissement rattache (relation chargee) : indispensable pour
  // afficher un porteur de type ETABLISSEMENT qui n'a pas de nom propre.
  @ApiProperty({ nullable: true })
  etablissement_nom: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
